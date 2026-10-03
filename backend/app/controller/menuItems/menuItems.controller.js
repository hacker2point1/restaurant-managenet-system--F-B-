const mongoose = require("mongoose");
const fs = require("fs/promises");

const MenuItem = require("../../models/menuItem.model");
const MenuCategory = require("../../models/menuCategory.model");
const Branch = require("../../models/branch.model");

const cloudinary = require("../../config/cloudinary");
const StatusCode = require("../../utils/statusCode");

const validId = (id) => mongoose.isValidObjectId(id);

const errorResponse = (res, error) => {
  console.error("MenuItem Error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      status: false,
      message: "Invalid field value",
    });
  }

  return res.status(StatusCode.SERVER_ERROR).json({
    status: false,
    message: "Internal server error",
  });
};

const parseArray = (value) => {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      throw new Error("Expected a JSON array");
    }

    return parsed;
  }

  throw new Error("Expected an array");
};

const parseBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new Error("Invalid boolean value");
};

const pagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(query.limit) || 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cleanupLocalFiles = async (files = []) => {
  await Promise.all(
    files.map((file) =>
      fs.unlink(file.path).catch(() => {})
    )
  );
};

const deleteCloudinaryImages = async (images = []) => {
  await Promise.all(
    images.map((image) =>
      cloudinary.uploader.destroy(image.publicId, {
        resource_type: "image",
      })
    )
  );
};

const uploadImages = async (files = []) => {
  const uploaded = [];

  try {
    for (const file of files) {
      const result = await cloudinary.uploader.upload(
        file.path,
        { folder: "menu-items" }
      );

      uploaded.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    return uploaded;
  } catch (error) {
    await deleteCloudinaryImages(uploaded).catch(() => {});
    throw error;
  } finally {
    await cleanupLocalFiles(files);
  }
};

const validateCategory = async (branchId, categoryId) => {
  return MenuCategory.findOne({
    _id: categoryId,
    branch: branchId,
    isDeleted: false,
  });
};

const populateItem = (query) =>
  query
    .populate("branch", "name branchCode")
    .populate("category", "name description")
    .populate("ingredients", "name");

const parseFields = (body, isUpdate = false) => {
  const allowed = [
    "name",
    "description",
    "price",
    "category",
    "foodType",
    "preparationTime",
    "isAvailable",
    "isFeatured",
  ];

  const data = {};

  for (const field of allowed) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (body.ingredients !== undefined) {
    data.ingredients = parseArray(body.ingredients);
  }

  if (body.tags !== undefined) {
    data.tags = parseArray(body.tags);
  }

  if (body.isAvailable !== undefined) {
    data.isAvailable = parseBoolean(body.isAvailable);
  }

  if (body.isFeatured !== undefined) {
    data.isFeatured = parseBoolean(body.isFeatured);
  }

  if (!isUpdate && !data.name) {
    throw new Error("Name is required");
  }

  return data;
};

const getFilteredItems = async (req, res, filters = {}) => {
  const { page, limit, skip } = pagination(req.query);

  const query = {
    isDeleted: false,
    ...filters,
  };

  if (req.query.branchId) {
    if (!validId(req.query.branchId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid branch ID",
      });
    }

    query.branch = req.query.branchId;
  }

  const [items, total] = await Promise.all([
    populateItem(
      MenuItem.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ),
    MenuItem.countDocuments(query),
  ]);

  return res.status(200).json({
    status: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: items,
  });
};

class MenuItemController {
  // CREATE MENU ITEM
  async createMenuItem(req, res) {
    try {
      const { branchId } = req.params;
      const files = req.files || [];

      if (!validId(branchId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      let data;

      try {
        data = parseFields(req.body);
      } catch (error) {
        return res.status(400).json({
          status: false,
          message: error.message,
        });
      }

      if (!validId(data.category)) {
        return res.status(400).json({
          status: false,
          message: "Valid category ID is required",
        });
      }

      if (
        !data.foodType ||
        data.price === undefined ||
        !Number.isFinite(Number(data.price)) ||
        Number(data.price) < 0
      ) {
        return res.status(400).json({
          status: false,
          message: "Valid price and foodType are required",
        });
      }

      const branch = await Branch.findById(branchId);

      if (!branch) {
        return res.status(404).json({
          status: false,
          message: "Branch not found",
        });
      }

      const category = await validateCategory(
        branchId,
        data.category
      );

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found in this branch",
        });
      }

      let images = [];

      try {
        images = await uploadImages(files);

        const item = await MenuItem.create({
          ...data,
          branch: branchId,
          images,
        });

        return res.status(201).json({
          status: true,
          message: "Menu item created successfully",
          data: item,
        });
      } catch (error) {
        await deleteCloudinaryImages(images).catch(() => {});
        throw error;
      }
    } catch (error) {
      return errorResponse(res, error);
    } finally {
      await cleanupLocalFiles(req.files || []);
    }
  }

  // GET ALL MENU ITEMS
  async getMenuItems(req, res) {
    try {
      const filters = {};

      if (req.query.category) {
        if (!validId(req.query.category)) {
          return res.status(400).json({
            status: false,
            message: "Invalid category ID",
          });
        }

        filters.category = req.query.category;
      }

      if (req.query.foodType) {
        filters.foodType = req.query.foodType;
      }

      if (req.query.isAvailable !== undefined) {
        filters.isAvailable = parseBoolean(
          req.query.isAvailable
        );
      }

      if (req.query.isFeatured !== undefined) {
        filters.isFeatured = parseBoolean(
          req.query.isFeatured
        );
      }

      return await getFilteredItems(req, res, filters);
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // GET MENU ITEM BY ID
  async getMenuItemById(req, res) {
    try {
      const { id } = req.params;

      if (!validId(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const item = await populateItem(
        MenuItem.findOne({
          _id: id,
          isDeleted: false,
        })
      );

      if (!item) {
        return res.status(404).json({
          status: false,
          message: "Menu item not found",
        });
      }

      return res.status(200).json({
        status: true,
        data: item,
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // UPDATE MENU ITEM
  async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const files = req.files || [];

      if (!validId(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const item = await MenuItem.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!item) {
        return res.status(404).json({
          status: false,
          message: "Menu item not found",
        });
      }

      let data;

      try {
        data = parseFields(req.body, true);
      } catch (error) {
        return res.status(400).json({
          status: false,
          message: error.message,
        });
      }

      if (data.category !== undefined) {
        if (!validId(data.category)) {
          return res.status(400).json({
            status: false,
            message: "Invalid category ID",
          });
        }

        const category = await validateCategory(
          item.branch,
          data.category
        );

        if (!category) {
          return res.status(404).json({
            status: false,
            message: "Category not found in this branch",
          });
        }
      }

      const oldImages = [...item.images];
      let newImages = [];

      try {
        if (files.length > 0) {
          newImages = await uploadImages(files);
          item.images = newImages;
        }

        Object.assign(item, data);

        await item.save();
      } catch (error) {
        await deleteCloudinaryImages(newImages).catch(() => {});
        throw error;
      }

      if (newImages.length > 0) {
        try {
          await deleteCloudinaryImages(oldImages);
        } catch (error) {
          console.error(
            "Old Cloudinary image cleanup failed:",
            error
          );
        }
      }

      return res.status(200).json({
        status: true,
        message: "Menu item updated successfully",
        data: item,
      });
    } catch (error) {
      return errorResponse(res, error);
    } finally {
      await cleanupLocalFiles(req.files || []);
    }
  }

    // SOFT DELETE
  async softDeleteMenuItem(req, res) {
    try {
      const { id } = req.params;

      if (!validId(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const item = await MenuItem.findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            isAvailable: false,
            isFeatured: false,
          },
        },
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          status: false,
          message: "Menu item not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Menu item soft deleted successfully",
        data: item,
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // HARD DELETE
  async hardDeleteMenuItem(req, res) {
    try {
      const { id } = req.params;

      if (!validId(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const item = await MenuItem.findById(id);

      if (!item) {
        return res.status(404).json({
          status: false,
          message: "Menu item not found",
        });
      }

      // Delete the database document first.
      await item.deleteOne();

      // Clean up associated Cloudinary images.
      try {
        await deleteCloudinaryImages(item.images);
      } catch (error) {
        console.error("Cloudinary cleanup failed:", error);
      }

      return res.status(200).json({
        status: true,
        message: "Menu item permanently deleted",
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // RESTORE
  async restoreMenuItem(req, res) {
    try {
      const { id } = req.params;

      if (!validId(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const item = await MenuItem.findOneAndUpdate(
        { _id: id, isDeleted: true },
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
          },
        },
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          status: false,
          message: "Deleted menu item not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Menu item restored successfully",
        data: item,
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // TOGGLE AVAILABILITY
  async toggleAvailability(req, res) {
    try {
      const { id } = req.params;

      if (!validId(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const item = await MenuItem.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!item) {
        return res.status(404).json({
          status: false,
          message: "Menu item not found",
        });
      }

      item.isAvailable = !item.isAvailable;

      await item.save();

      return res.status(200).json({
        status: true,
        message: "Availability updated successfully",
        data: item,
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // TOGGLE FEATURED
  async toggleFeatured(req, res) {
    try {
      const { id } = req.params;

      if (!validId(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const item = await MenuItem.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!item) {
        return res.status(404).json({
          status: false,
          message: "Menu item not found",
        });
      }

      item.isFeatured = !item.isFeatured;

      await item.save();

      return res.status(200).json({
        status: true,
        message: "Featured status updated successfully",
        data: item,
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // SEARCH MENU ITEMS
  async searchMenuItems(req, res) {
    try {
      const { search } = req.query;

      if (!search || !search.trim()) {
        return res.status(400).json({
          status: false,
          message: "Search keyword is required",
        });
      }

      return await getFilteredItems(req, res, {
        $or: [
          {
            name: {
              $regex: escapeRegex(search.trim()),
              $options: "i",
            },
          },
          {
            description: {
              $regex: escapeRegex(search.trim()),
              $options: "i",
            },
          },
          {
            tags: {
              $regex: escapeRegex(search.trim()),
              $options: "i",
            },
          },
        ],
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // GET ITEMS BY CATEGORY
  async getItemsByCategory(req, res) {
    try {
      const { categoryId } = req.params;

      if (!validId(categoryId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid category ID",
        });
      }

      return await getFilteredItems(req, res, {
        category: categoryId,
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // GET ITEMS BY PRICE RANGE
  async getItemsByPriceRange(req, res) {
    try {
      const { minPrice, maxPrice } = req.query;

      if (
        minPrice === undefined ||
        maxPrice === undefined ||
        !Number.isFinite(Number(minPrice)) ||
        !Number.isFinite(Number(maxPrice)) ||
        Number(minPrice) < 0 ||
        Number(maxPrice) < Number(minPrice)
      ) {
        return res.status(400).json({
          status: false,
          message: "Valid minPrice and maxPrice are required",
        });
      }

      return await getFilteredItems(req, res, {
        price: {
          $gte: Number(minPrice),
          $lte: Number(maxPrice),
        },
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // GET ITEMS BY RATING
  async getItemsByRating(req, res) {
    try {
      const { minRating = 4 } = req.query;

      if (
        !Number.isFinite(Number(minRating)) ||
        Number(minRating) < 0 ||
        Number(minRating) > 5
      ) {
        return res.status(400).json({
          status: false,
          message: "Rating must be between 0 and 5",
        });
      }

      return await getFilteredItems(req, res, {
        averageRating: {
          $gte: Number(minRating),
        },
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  // GET POPULAR ITEMS
  async getPopularItems(req, res) {
    try {
      const { page, limit, skip } = pagination(req.query);

      const match = {
        isDeleted: false,
        isAvailable: true,
      };

      if (req.query.branchId) {
        if (!validId(req.query.branchId)) {
          return res.status(400).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        match.branch = new mongoose.Types.ObjectId(
          req.query.branchId
        );
      }

      const result = await MenuItem.aggregate([
        { $match: match },

        {
          $sort: {
            totalReviews: -1,
            averageRating: -1,
            createdAt: -1,
          },
        },

        {
          $facet: {
            data: [
              { $skip: skip },
              { $limit: limit },

              {
                $lookup: {
                  from: "menucategories",
                  localField: "category",
                  foreignField: "_id",
                  as: "categoryDetails",
                },
              },

              {
                $unwind: {
                  path: "$categoryDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $project: {
                  name: 1,
                  description: 1,
                  price: 1,
                  images: 1,
                  foodType: 1,
                  averageRating: 1,
                  totalReviews: 1,
                  isAvailable: 1,
                  isFeatured: 1,
                  branch: 1,
                  category: 1,
                  categoryName: "$categoryDetails.name",
                },
              },
            ],

            total: [
              { $count: "count" },
            ],
          },
        },
      ]);

      const items = result[0]?.data || [];
      const total = result[0]?.total[0]?.count || 0;

      return res.status(200).json({
        status: true,
        message: "Popular menu items fetched successfully",
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: items,
      });
    } catch (error) {
      return errorResponse(res, error);
    }
  }
}

module.exports = new MenuItemController();