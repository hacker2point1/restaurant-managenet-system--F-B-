const fs = require('fs')
const mongoose = require("mongoose");

const MenuCategory = require("../../models/menuCategory.model");
const MenuItem = require("../../models/menuItem.model");
const Branch = require("../../models/branch.model");
const cloudinary = require("../../config/cloudinary");
const statusCode = require("../../utils/statusCode");



class menuCategoryController  {

  // ============================================================
  // CREATE CATEGORY
  // ============================================================

async createCategory(req, res) {
  try {
    const { branchId } = req.params;

    const {
      name,
      description,
      displayOrder,
      isActive,
    } = req.body;

    // --------------------------------------------------------
    // Validate Branch ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid branch ID",
      });
    }

    // --------------------------------------------------------
    // Validate Name
    // --------------------------------------------------------

    if (!name || !name.trim()) {
      return res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Category name is required",
      });
    }

    // --------------------------------------------------------
    // Check Branch
    // --------------------------------------------------------

    const branch = await Branch.findOne({
      _id: branchId,
      isDeleted: false,
    });

    if (!branch) {
      return res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Branch not found",
      });
    }

    // --------------------------------------------------------
    // Check Duplicate Category
    // --------------------------------------------------------

    const existingCategory = await MenuCategory.findOne({
      branch: branchId,
      name: name.trim(),
      isDeleted: false,
    });

    if (existingCategory) {
      return res.status(statusCode.CONFLICT).json({
        status: false,
        message: "Category already exists in this branch",
      });
    }

    // --------------------------------------------------------
    // Upload Image To Cloudinary
    // --------------------------------------------------------

    let categoryImage = {
      url: "",
      publicId: "",
    };

    if (req.file) {
      try {
        const uploadedImage = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "menu-categories",
          }
        );

        categoryImage = {
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id,
        };
      } finally {
        // Delete local file
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // --------------------------------------------------------
    // Create Category
    // --------------------------------------------------------

    const category = await MenuCategory.create({
      branch: branchId,
      name: name.trim(),
      description,
      image: categoryImage,

      displayOrder:
        displayOrder !== undefined
          ? Number(displayOrder)
          : 0,

      isActive:
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : true,
    });

    return res.status(statusCode.CREATED).json({
      status: true,
      message: "Menu category created successfully",
      data: category,
    });

  } catch (error) {
    console.error("Create Menu Category Error:", error);

    // If Multer uploaded a file but Cloudinary failed
    if (
      req.file &&
      req.file.path &&
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to create menu category",
      error: error.message,
    });
  }
}

  // ============================================================
  // GET ALL CATEGORIES
  // ============================================================

  async getCategories(req, res) {
    try {
      const { branchId } = req.params;

      const {
        page = 1,
        limit = 10,
        search = "",
        isActive,
      } = req.query;

      // --------------------------------------------------------
      // Validate Branch ID
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const pageNumber = Math.max(
        parseInt(page) || 1,
        1
      );

      const limitNumber = Math.max(
        parseInt(limit) || 10,
        1
      );

      const skip =
        (pageNumber - 1) * limitNumber;

      // --------------------------------------------------------
      // Match Stage
      // --------------------------------------------------------

      const matchStage = {
        branch:
          new mongoose.Types.ObjectId(branchId),

        isDeleted: false,
      };

      // Search
      if (search.trim()) {
        matchStage.name = {
          $regex: search.trim(),
          $options: "i",
        };
      }

      // Active filter
      if (isActive !== undefined) {
        matchStage.isActive =
          isActive === "true";
      }

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const result =
        await MenuCategory.aggregate([

          // 1. Filter categories
          {
            $match: matchStage,
          },

          // 2. Get menu item count
          {
            $lookup: {
              from: "menuitems",

              let: {
                categoryId: "$_id",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [

                        // MenuItem.category
                        // must equal current category
                        {
                          $eq: [
                            "$category",
                            "$$categoryId",
                          ],
                        },

                        // Only available/non-deleted
                        // items if your model later
                        // adds isDeleted
                        {
                          $eq: [
                            "$isAvailable",
                            true,
                          ],
                        },
                      ],
                    },
                  },
                },

                {
                  $count: "count",
                },
              ],

              as: "menuItemCount",
            },
          },

          // 3. Convert array count to number
          {
            $addFields: {
              menuItemCount: {
                $ifNull: [
                  {
                    $arrayElemAt: [
                      "$menuItemCount.count",
                      0,
                    ],
                  },
                  0,
                ],
              },
            },
          },

          // 4. Sort
          {
            $sort: {
              displayOrder: 1,
              createdAt: -1,
            },
          },

          // 5. Pagination + total
          {
            $facet: {

              data: [
                {
                  $skip: skip,
                },

                {
                  $limit: limitNumber,
                },
              ],

              total: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ]);

      const categories =
        result[0]?.data || [];

      const total =
        result[0]?.total[0]?.count || 0;

      return res.status(statusCode.OK).json({
        status: true,
        message:
          "Menu categories fetched successfully",

        data: categories,

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      });

    } catch (error) {
      console.error(
        "Get Menu Categories Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to fetch menu categories",
        error: error.message,
      });
    }
  }


  // ============================================================
  // GET CATEGORY BY ID
  // ============================================================

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      const result =
        await MenuCategory.aggregate([

          // Category
          {
            $match: {
              _id:
                new mongoose.Types.ObjectId(id),

              isDeleted: false,
            },
          },

          // Branch
          {
            $lookup: {
              from: "branches",

              localField: "branch",
              foreignField: "_id",

              as: "branch",
            },
          },

          {
            $unwind: {
              path: "$branch",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Menu Items
          {
            $lookup: {
              from: "menuitems",

              let: {
                categoryId: "$_id",
              },

              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: [
                            "$category",
                            "$$categoryId",
                          ],
                        },
                        {
                          $eq: [
                            "$isAvailable",
                            true,
                          ],
                        },
                      ],
                    },
                  },
                },
              ],

              as: "menuItems",
            },
          },

          // Project required data
          {
            $project: {

              name: 1,

              description: 1,

              displayOrder: 1,

              isActive: 1,

              createdAt: 1,

              updatedAt: 1,

              branch: {
                _id: "$branch._id",
                name: "$branch.name",
              },

              menuItemCount: {
                $size: "$menuItems",
              },
            },
          },
        ]);

      if (!result.length) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Menu category not found",
        });
      }

      return res.status(statusCode.OK).json({
        status: true,
        message:
          "Menu category fetched successfully",

        data: result[0],
      });

    } catch (error) {
      console.error(
        "Get Menu Category By ID Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to fetch menu category",
        error: error.message,
      });
    }
  }


  // ============================================================
  // UPDATE CATEGORY
  // ============================================================

async updateCategory(req, res) {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      displayOrder,
      isActive,
    } = req.body;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid category ID",
      });
    }

    // --------------------------------------------------------
    // Find Category
    // --------------------------------------------------------

    const category = await MenuCategory.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!category) {
      return res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Menu category not found",
      });
    }

    // --------------------------------------------------------
    // Update Name
    // --------------------------------------------------------

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Category name cannot be empty",
        });
      }

      const duplicate = await MenuCategory.findOne({
        _id: {
          $ne: id,
        },

        branch: category.branch,

        name: name.trim(),

        isDeleted: false,
      });

      if (duplicate) {
        return res.status(statusCode.CONFLICT).json({
          status: false,
          message:
            "Category with this name already exists in this branch",
        });
      }

      category.name = name.trim();
    }

    // --------------------------------------------------------
    // Update Description
    // --------------------------------------------------------

    if (description !== undefined) {
      category.description = description;
    }

    // --------------------------------------------------------
    // Update Display Order
    // --------------------------------------------------------

    if (displayOrder !== undefined) {
      category.displayOrder = Number(displayOrder);
    }

    // --------------------------------------------------------
    // Update Active Status
    // --------------------------------------------------------

    if (isActive !== undefined) {
      category.isActive =
        isActive === "true" || isActive === true;
    }

    // --------------------------------------------------------
    // Update Image
    // --------------------------------------------------------

    if (req.file) {

      // ------------------------------------------------------
      // Delete Old Cloudinary Image
      // ------------------------------------------------------

      if (
        category.image &&
        category.image.publicId
      ) {
        try {
          await cloudinary.uploader.destroy(
            category.image.publicId,
            {
              resource_type: "image",
            }
          );
        } catch (cloudinaryError) {
          console.error(
            "Old category image delete error:",
            cloudinaryError
          );
        }
      }

      // ------------------------------------------------------
      // Upload New Image
      // ------------------------------------------------------

      try {
        const uploadedImage =
          await cloudinary.uploader.upload(
            req.file.path,
            {
              folder: "menu-categories",
            }
          );

        category.image = {
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id,
        };

      } finally {
        // Delete local file
        if (
          req.file.path &&
          fs.existsSync(req.file.path)
        ) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    // --------------------------------------------------------
    // Save
    // --------------------------------------------------------

    await category.save();

    return res.status(statusCode.OK).json({
      status: true,
      message: "Menu category updated successfully",
      data: category,
    });

  } catch (error) {
    console.error(
      "Update Menu Category Error:",
      error
    );

    // Clean uploaded file if something failed
    if (
      req.file &&
      req.file.path &&
      fs.existsSync(req.file.path)
    ) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update menu category",
      error: error.message,
    });
  }
}

  // ============================================================
  // SOFT DELETE CATEGORY
  // ============================================================

  async softDeleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      const category =
        await MenuCategory.findOne({
          _id: id,
          isDeleted: false,
        });

      if (!category) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message:
            "Menu category not found",
        });
      }

      // Soft delete
      category.isDeleted = true;

      category.deletedAt = new Date();

      category.isActive = false;

      await category.save();

      return res.status(statusCode.OK).json({
        status: true,
        message:
          "Menu category soft deleted successfully",
      });

    } catch (error) {
      console.error(
        "Soft Delete Menu Category Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to soft delete menu category",
        error: error.message,
      });
    }
  }


  // ============================================================
  // RESTORE CATEGORY
  // ============================================================

  async restore(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      const category =
        await MenuCategory.findOne({
          _id: id,
          isDeleted: true,
        });

      if (!category) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message:
            "Deleted menu category not found",
        });
      }

      // Check duplicate active category
      const duplicate =
        await MenuCategory.findOne({
          _id: {
            $ne: id,
          },

          branch: category.branch,

          name: category.name,

          isDeleted: false,
        });

      if (duplicate) {
        return res.status(statusCode.CONFLICT).json({
          status: false,
          message:
            "Another active category with the same name already exists in this branch",
        });
      }

      // Restore
      category.isDeleted = false;

      category.deletedAt = null;

      category.isActive = true;

      await category.save();

      return res.status(statusCode.OK).json({
        status: true,
        message:
          "Menu category restored successfully",

        data: category,
      });

    } catch (error) {
      console.error(
        "Restore Menu Category Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to restore menu category",
        error: error.message,
      });
    }
  }


  // ============================================================
  // HARD DELETE CATEGORY
  // ============================================================

  async hardDeleteCategory(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      const category =
        await MenuCategory.findById(id);

      if (!category) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message:
            "Menu category not found",
        });
      }

      // --------------------------------------------------------
      // Check Menu Items
      // --------------------------------------------------------

      const menuItemCount =
        await MenuItem.countDocuments({
          category: id,
        });

      if (menuItemCount > 0) {
        return res.status(statusCode.CONFLICT).json({
          status: false,
          message:
            "Category cannot be permanently deleted because menu items are associated with it",

          menuItemCount,
        });
      }

      // --------------------------------------------------------
      // Permanent Delete
      // --------------------------------------------------------

      await MenuCategory.findByIdAndDelete(id);

      return res.status(statusCode.OK).json({
        status: true,
        message:
          "Menu category permanently deleted successfully",
      });

    } catch (error) {
      console.error(
        "Hard Delete Menu Category Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to permanently delete menu category",
        error: error.message,
      });
    }
  }


  // ============================================================
  // ACTIVATE CATEGORY
  // ============================================================

  async activateCategory(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      const category =
        await MenuCategory.findOneAndUpdate(
          {
            _id: id,
            isDeleted: false,
          },

          {
            $set: {
              isActive: true,
            },
          },

          {
            new: true,
          }
        );

      if (!category) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message:
            "Menu category not found",
        });
      }

      return res.status(statusCode.OK).json({
        status: true,
        message:
          "Menu category activated successfully",
        data: category,
      });

    } catch (error) {
      console.error(
        "Activate Menu Category Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to activate menu category",
        error: error.message,
      });
    }
  }


  // ============================================================
  // DEACTIVATE CATEGORY
  // ============================================================

  async deactivateCategory(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      const category =
        await MenuCategory.findOneAndUpdate(
          {
            _id: id,
            isDeleted: false,
          },

          {
            $set: {
              isActive: false,
            },
          },

          {
            new: true,
          }
        );

      if (!category) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message:
            "Menu category not found",
        });
      }

      return res.status(statusCode.OK).json({
        status: true,
        message:
          "Menu category deactivated successfully",
        data: category,
      });

    } catch (error) {
      console.error(
        "Deactivate Menu Category Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to deactivate menu category",
        error: error.message,
      });
    }
  }


  // ============================================================
  // GET CATEGORY MENU ITEMS
  // ============================================================

  async getCategoryMenuItems(req, res) {
    try {
      const { id } = req.params;

      const {
        page = 1,
        limit = 10,
        search = "",
        foodType,
        isAvailable,
      } = req.query;

      // Validate category ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      const pageNumber = Math.max(
        parseInt(page) || 1,
        1
      );

      const limitNumber = Math.max(
        parseInt(limit) || 10,
        1
      );

      const skip =
        (pageNumber - 1) * limitNumber;

      // --------------------------------------------------------
      // Check Category
      // --------------------------------------------------------

      const category =
        await MenuCategory.findOne({
          _id: id,
          isDeleted: false,
        }).lean();

      if (!category) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message:
            "Menu category not found",
        });
      }

      // --------------------------------------------------------
      // Menu Item Match
      // --------------------------------------------------------

      const matchStage = {
        category:
          new mongoose.Types.ObjectId(id),
      };

      // Search
      if (search.trim()) {
        matchStage.$or = [
          {
            name: {
              $regex: search.trim(),
              $options: "i",
            },
          },
          {
            description: {
              $regex: search.trim(),
              $options: "i",
            },
          },
        ];
      }

      // Food type
      if (foodType) {
        matchStage.foodType =
          foodType;
      }

      // Availability
      if (isAvailable !== undefined) {
        matchStage.isAvailable =
          isAvailable === "true";
      }

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const result =
        await MenuItem.aggregate([

          // Filter menu items
          {
            $match: matchStage,
          },

          // Get category
          {
            $lookup: {
              from: "menucategories",

              localField: "category",
              foreignField: "_id",

              as: "category",
            },
          },

          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Get branch
          {
            $lookup: {
              from: "branches",

              localField: "branch",
              foreignField: "_id",

              as: "branch",
            },
          },

          {
            $unwind: {
              path: "$branch",
              preserveNullAndEmptyArrays: true,
            },
          },

          // Sort
          {
            $sort: {
              createdAt: -1,
            },
          },

          // Pagination
          {
            $facet: {

              data: [
                {
                  $skip: skip,
                },

                {
                  $limit: limitNumber,
                },
              ],

              total: [
                {
                  $count: "count",
                },
              ],
            },
          },
        ]);

      const menuItems =
        result[0]?.data || [];

      const total =
        result[0]?.total[0]?.count || 0;

      return res.status(statusCode.OK).json({
        status: true,

        message:
          "Category menu items fetched successfully",

        category: {
          _id: category._id,
          name: category.name,
          description:
            category.description,
        },

        data: menuItems,

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      });

    } catch (error) {
      console.error(
        "Get Category Menu Items Error:",
        error
      );

      return res.status(
        statusCode.INTERNAL_SERVER_ERROR
      ).json({
        status: false,
        message:
          "Failed to fetch category menu items",
        error: error.message,
      });
    }
  }
};

module.exports = new menuCategoryController();