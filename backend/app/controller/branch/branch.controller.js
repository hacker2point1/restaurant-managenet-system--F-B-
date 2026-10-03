const mongoose = require("mongoose");
const fs = require("fs");

const Branch = require("../../models/branch.model");
const Restaurant = require("../../models/resturant.model");

const cloudinary = require("../../config/cloudinary");
const statusCode = require("../../utils/statusCode");

const uploadToCloudinary = (filePath, folder) =>
  cloudinary.uploader.upload(filePath, { folder });

class BranchController {

  // ============================================================
  // CREATE BRANCH
  // POST /api/restaurants/:restaurantId/branches
  // ============================================================

  async createBranch(req, res) {
    try {
      const { restaurantId } = req.params;

      const {
        name,
        branchCode,
        contact,
        address,
        openingHours,
        isActive,
      } = req.body;

      // --------------------------------------------------------
      // Validate restaurant ID
      // --------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      // --------------------------------------------------------
      // Validate required fields
      // --------------------------------------------------------

      if (!name || !name.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Branch name is required",
        });
      }

      if (!branchCode || !branchCode.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Branch code is required",
        });
      }

      // --------------------------------------------------------
      // Check restaurant
      // --------------------------------------------------------

      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        isDeleted: false,
      });

      if (!restaurant) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Restaurant not found",
        });
      }

      // --------------------------------------------------------
      // Check duplicate branch code
      // --------------------------------------------------------

      const existingBranch = await Branch.findOne({
        restaurant: restaurantId,
        branchCode: branchCode.trim().toUpperCase(),
        isDeleted: false,
      });

      if (existingBranch) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Branch code already exists for this restaurant",
        });
      }

      // --------------------------------------------------------
      // Parse JSON form-data fields
      // --------------------------------------------------------

      let parsedContact = {};
      let parsedAddress = {};
      let parsedOpeningHours = {};

      try {
        if (contact) {
          parsedContact =
            typeof contact === "string"
              ? JSON.parse(contact)
              : contact;
        }

        if (address) {
          parsedAddress =
            typeof address === "string"
              ? JSON.parse(address)
              : address;
        }

        if (openingHours) {
          parsedOpeningHours =
            typeof openingHours === "string"
              ? JSON.parse(openingHours)
              : openingHours;
        }
      } catch (error) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Invalid JSON format for contact, address or openingHours",
        });
      }

      // --------------------------------------------------------
      // Upload branch images
      // --------------------------------------------------------

      const uploadedImages = [];

      for (const file of req.files || []) {
        const uploadedImage = await uploadToCloudinary(
          file.path,
          "restaurant-management/branches"
        );

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        uploadedImages.push({
          url: uploadedImage.secure_url,
          publicId: uploadedImage.public_id,
        });
      }

      // --------------------------------------------------------
      // Create branch
      // --------------------------------------------------------

      const branch = await Branch.create({
        restaurant: restaurantId,

        name: name.trim(),

        branchCode: branchCode
          .trim()
          .toUpperCase(),

        images: uploadedImages,

        contact: parsedContact,

        address: parsedAddress,

        openingHours: parsedOpeningHours,

        isActive:
          isActive !== undefined
            ? isActive === "true" || isActive === true
            : true,

        isDeleted: false,

        deletedAt: null,
      });

      return res.status(201).json({
        status: true,
        message: "Branch created successfully",
        data: branch,
      });

    } catch (error) {
      console.error("Create Branch Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to create branch",
        error: error.message,
      });
    }
  }


  // ============================================================
  // GET ALL BRANCHES
  // GET /api/restaurants/:restaurantId/branches
  // ============================================================

  async getBranches(req, res) {
    try {
      const { restaurantId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        isDeleted: false,
      });

      if (!restaurant) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Restaurant not found",
        });
      }

      const branches = await Branch.find({
        restaurant: restaurantId,
        isDeleted: false,
      }).sort({
        createdAt: -1,
      });

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Branches fetched successfully",
        count: branches.length,
        data: branches,
      });

    } catch (error) {
      console.error("Get Branches Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch branches",
        error: error.message,
      });
    }
  }


  // ============================================================
  // GET BRANCH BY ID
  // GET /api/branches/:id
  // ============================================================

  async getBranchById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findOne({
        _id: id,
        isDeleted: false,
      }).populate("restaurant", "name");

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Branch fetched successfully",
        data: branch,
      });

    } catch (error) {
      console.error("Get Branch By ID Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch branch",
        error: error.message,
      });
    }
  }


  // ============================================================
  // UPDATE BRANCH
  // PATCH /api/branches/:id
  // ============================================================

  // async updateBranch(req, res) {
  //   try {
  //     const { id } = req.params;

  //     const {
  //       name,
  //       branchCode,
  //       contact,
  //       address,
  //       isActive,
  //     } = req.body;

  //     if (!mongoose.Types.ObjectId.isValid(id)) {
  //       return res.status(statusCode.BAD_REQUEST).json({
  //         status: false,
  //         message: "Invalid branch ID",
  //       });
  //     }

  //     const branch = await Branch.findOne({
  //       _id: id,
  //       isDeleted: false,
  //     });

  //     if (!branch) {
  //       return res.status(statusCode.NOT_FOUND).json({
  //         status: false,
  //         message: "Branch not found",
  //       });
  //     }

  //     // --------------------------------------------------------
  //     // Branch name
  //     // --------------------------------------------------------

  //     if (name !== undefined) {
  //       if (!name.trim()) {
  //         return res.status(statusCode.BAD_REQUEST).json({
  //           status: false,
  //           message: "Branch name cannot be empty",
  //         });
  //       }

  //       branch.name = name.trim();
  //     }

  //     // --------------------------------------------------------
  //     // Branch code
  //     // --------------------------------------------------------

  //     if (branchCode !== undefined) {
  //       const newBranchCode = branchCode
  //         .trim()
  //         .toUpperCase();

  //       const existingBranch = await Branch.findOne({
  //         restaurant: branch.restaurant,
  //         branchCode: newBranchCode,
  //         _id: { $ne: id },
  //         isDeleted: false,
  //       });

  //       if (existingBranch) {
  //         return res.status(statusCode.BAD_REQUEST).json({
  //           status: false,
  //           message:
  //             "Branch code already exists for this restaurant",
  //         });
  //       }

  //       branch.branchCode = newBranchCode;
  //     }

  //     // --------------------------------------------------------
  //     // Contact
  //     // --------------------------------------------------------

  //     if (contact !== undefined) {
  //       try {
  //         const parsedContact =
  //           typeof contact === "string"
  //             ? JSON.parse(contact)
  //             : contact;

  //         branch.contact = {
  //           ...branch.contact?.toObject?.(),
  //           ...parsedContact,
  //         };
  //       } catch (error) {
  //         return res.status(statusCode.BAD_REQUEST).json({
  //           status: false,
  //           message: "Invalid contact JSON",
  //         });
  //       }
  //     }

  //     // --------------------------------------------------------
  //     // Address
  //     // --------------------------------------------------------

  //     if (address !== undefined) {
  //       try {
  //         const parsedAddress =
  //           typeof address === "string"
  //             ? JSON.parse(address)
  //             : address;

  //         branch.address = {
  //           ...branch.address?.toObject?.(),
  //           ...parsedAddress,
  //         };
  //       } catch (error) {
  //         return res.status(statusCode.BAD_REQUEST).json({
  //           status: false,
  //           message: "Invalid address JSON",
  //         });
  //       }
  //     }

  //     // --------------------------------------------------------
  //     // Active status
  //     // --------------------------------------------------------

  //     if (isActive !== undefined) {
  //       branch.isActive =
  //         isActive === "true" ||
  //         isActive === true;
  //     }

  //     // --------------------------------------------------------
  //     // Replace image
  //     // --------------------------------------------------------

  //     if (req.file) {

  //       // Delete old Cloudinary image
  //       if (branch.image?.publicId) {
  //         try {
  //           await cloudinary.uploader.destroy(
  //             branch.image.publicId
  //           );
  //         } catch (error) {
  //           console.error(
  //             "Old branch image delete error:",
  //             error.message
  //           );
  //         }
  //       }

  //       // Upload new image
  //       const uploadedImage =
  //         await uploadToCloudinary(
  //           req.file.buffer,
  //           "restaurant-management/branches"
  //         );

  //       branch.image = {
  //         url: uploadedImage.secure_url,
  //         publicId: uploadedImage.public_id,
  //       };
  //     }

  //     await branch.save();

  //     return res.status(statusCode.SUCCESS).json({
  //       status: true,
  //       message: "Branch updated successfully",
  //       data: branch,
  //     });

  //   } catch (error) {
  //     console.error("Update Branch Error:", error);

  //     return res.status(statusCode.SERVER_ERROR).json({
  //       status: false,
  //       message: "Failed to update branch",
  //       error: error.message,
  //     });
  //   }
  // }


  async updateBranch(req, res) {
  try {
    const { id } = req.params;

    const {
      name,
      branchCode,
      contact,
      address,
      openingHours,
      isActive,
    } = req.body;

    // ========================================================
    // Validate Branch ID
    // ========================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(statusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid branch ID",
      });
    }

    // ========================================================
    //  Find Branch
    // ========================================================

    const branch = await Branch.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!branch) {
      return res.status(statusCode.NOT_FOUND).json({
        status: false,
        message: "Branch not found",
      });
    }

    // ========================================================
    //  Branch Name
    // ========================================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Branch name cannot be empty",
        });
      }

      branch.name = name.trim();
    }

    // ========================================================
    // Branch Code
    // ========================================================

    if (branchCode !== undefined) {
      if (!branchCode.trim()) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Branch code cannot be empty",
        });
      }

      const newBranchCode = branchCode
        .trim()
        .toUpperCase();

      const existingBranch = await Branch.findOne({
        restaurant: branch.restaurant,
        branchCode: newBranchCode,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (existingBranch) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Branch code already exists for this restaurant",
        });
      }

      branch.branchCode = newBranchCode;
    }

    // ========================================================
    //  Contact
    // ========================================================

    if (contact !== undefined) {
      try {
        const parsedContact =
          typeof contact === "string"
            ? JSON.parse(contact)
            : contact;

        branch.contact = {
          ...(branch.contact?.toObject?.() || branch.contact || {}),
          ...parsedContact,
        };
      } catch (error) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid contact JSON",
        });
      }
    }

    // ========================================================
    //  Address
    // ========================================================

    if (address !== undefined) {
      try {
        const parsedAddress =
          typeof address === "string"
            ? JSON.parse(address)
            : address;

        branch.address = {
          ...(branch.address?.toObject?.() || branch.address || {}),
          ...parsedAddress,
        };
      } catch (error) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid address JSON",
        });
      }
    }

    // ========================================================
    // Opening Hours
    // ========================================================

    if (openingHours !== undefined) {
      try {
        const parsedOpeningHours =
          typeof openingHours === "string"
            ? JSON.parse(openingHours)
            : openingHours;

        branch.openingHours = {
          ...(branch.openingHours?.toObject?.() ||
            branch.openingHours ||
            {}),
          ...parsedOpeningHours,
        };
      } catch (error) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid openingHours JSON",
        });
      }
    }

    // ========================================================
    //Active Status
    // ========================================================

    if (isActive !== undefined) {
      branch.isActive =
        isActive === "true" ||
        isActive === true;
    }

    // ========================================================
    //  Add New Images
    // ========================================================
   
    if (req.files && req.files.length > 0) {
      const existingImagesCount = branch.images
        ? branch.images.length
        : 0;

      const newImagesCount = req.files.length;

      const totalImages =
        existingImagesCount + newImagesCount;

      // ------------------------------------------------------
      // Check maximum image limit
      // ------------------------------------------------------

      if (totalImages > 10) {
        const remainingSlots =
          10 - existingImagesCount;

        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: `You can upload only ${remainingSlots} more image(s). Maximum 10 images are allowed for a branch.`,
          currentImages: existingImagesCount,
          attemptedToAdd: newImagesCount,
          maximumImages: 10,
        });
      }

      // ------------------------------------------------------
      // Upload new images to Cloudinary
      // ------------------------------------------------------

      const newImages = [];

      for (const file of req.files) {
        try {
          const uploadedImage =
            await uploadToCloudinary(
              file.path,
              "restaurant-management/branches"
            );

          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }

          newImages.push({
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
          });
        } catch (uploadError) {
          console.error(
            "Branch image upload error:",
            uploadError.message
          );

          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }

          // --------------------------------------------------
          // Cleanup already uploaded images if one upload fails
          // --------------------------------------------------

          for (const image of newImages) {
            if (image.publicId) {
              try {
                await cloudinary.uploader.destroy(
                  image.publicId
                );
              } catch (deleteError) {
                console.error(
                  "Cloudinary cleanup error:",
                  deleteError.message
                );
              }
            }
          }

          return res.status(statusCode.SERVER_ERROR).json({
            status: false,
            message: "Failed to upload branch image",
            error: uploadError.message,
          });
        }
      }

     
      branch.images.push(...newImages);
    }

    await branch.save();

    // ========================================================
    //  Success Response
    // ========================================================

    return res.status(statusCode.SUCCESS).json({
      status: true,
      message: "Branch updated successfully",
      data: branch,
    });

  } catch (error) {
    console.error("Update Branch Error:", error);

    return res.status(statusCode.SERVER_ERROR).json({
      status: false,
      message: "Failed to update branch",
      error: error.message,
    });
  }
}


  // ============================================================
  // DELETE BRANCH - SOFT DELETE
  // DELETE /api/branches/:id
  // ============================================================

  // async deleteBranch(req, res) {
  //   try {
  //     const { id } = req.params;

  //     if (!mongoose.Types.ObjectId.isValid(id)) {
  //       return res.status(statusCode.BAD_REQUEST).json({
  //         status: false,
  //         message: "Invalid branch ID",
  //       });
  //     }

  //     const branch = await Branch.findOne({
  //       _id: id,
  //       isDeleted: false,
  //     });

  //     if (!branch) {
  //       return res.status(statusCode.NOT_FOUND).json({
  //         status: false,
  //         message: "Branch not found",
  //       });
  //     }

  //     branch.isDeleted = true;
  //     branch.deletedAt = new Date();
  //     branch.isActive = false;

  //     await branch.save();

  //     return res.status(statusCode.SUCCESS).json({
  //       status: true,
  //       message: "Branch deleted successfully",
  //     });

  //   } catch (error) {
  //     console.error("Delete Branch Error:", error);

  //     return res.status(statusCode.SERVER_ERROR).json({
  //       status: false,
  //       message: "Failed to delete branch",
  //       error: error.message,
  //     });
  //   }
  // }


  // ============================================================
  // SOFT DELETE
  // PATCH /api/branches/:id/soft-delete
  // ============================================================

  async softDeleteBranch(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found or already deleted",
        });
      }

      branch.isDeleted = true;
      branch.deletedAt = new Date();
      branch.isActive = false;

      await branch.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Branch soft deleted successfully",
        data: branch,
      });

    } catch (error) {
      console.error("Soft Delete Branch Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to soft delete branch",
        error: error.message,
      });
    }
  }


  // ============================================================
  // RESTORE BRANCH
  // PATCH /api/branches/:id/restore
  // ============================================================

  async restoreBranch(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findOne({
        _id: id,
        isDeleted: true,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Deleted branch not found",
        });
      }

      branch.isDeleted = false;
      branch.deletedAt = null;
      branch.isActive = true;

      await branch.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Branch restored successfully",
        data: branch,
      });

    } catch (error) {
      console.error("Restore Branch Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to restore branch",
        error: error.message,
      });
    }
  }


  // ============================================================
  // HARD DELETE
  // DELETE /api/branches/:id/hard-delete
  // ============================================================

  async hardDeleteBranch(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findById(id);

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      // Delete Cloudinary image
      if (branch.image?.publicId) {
        try {
          await cloudinary.uploader.destroy(
            branch.image.publicId
          );
        } catch (error) {
          console.error(
            "Branch image delete error:",
            error.message
          );
        }
      }

      await Branch.findByIdAndDelete(id);

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Branch permanently deleted",
      });

    } catch (error) {
      console.error("Hard Delete Branch Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to permanently delete branch",
        error: error.message,
      });
    }
  }


  // ============================================================
  // ACTIVATE
  // PATCH /api/branches/:id/activate
  // ============================================================

  async activateBranch(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      branch.isActive = true;

      await branch.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Branch activated successfully",
        data: branch,
      });

    } catch (error) {
      console.error("Activate Branch Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to activate branch",
        error: error.message,
      });
    }
  }


  // ============================================================
  // DEACTIVATE
  // PATCH /api/branches/:id/deactivate
  // ============================================================

  async deactivateBranch(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      branch.isActive = false;

      await branch.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Branch deactivated successfully",
        data: branch,
      });

    } catch (error) {
      console.error("Deactivate Branch Error:", error);

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to deactivate branch",
        error: error.message,
      });
    }
  }


  // ============================================================
  // GET OPENING HOURS
  // GET /api/branches/:id/opening-hours
  // ============================================================

  async getBranchOperatingHours(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      const branch = await Branch.findOne({
        _id: id,
        isDeleted: false,
      }).select(
        "name branchCode openingHours"
      );

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message: "Opening hours fetched successfully",
        data: {
          branchId: branch._id,
          branchName: branch.name,
          branchCode: branch.branchCode,
          openingHours: branch.openingHours,
        },
      });

    } catch (error) {
      console.error(
        "Get Opening Hours Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch opening hours",
        error: error.message,
      });
    }
  }


  // ============================================================
  // UPDATE OPENING HOURS
  // PATCH /api/branches/:id/opening-hours
  // ============================================================

  async updateBranchOperatingHours(req, res) {
    try {
      const { id } = req.params;

      const { openingHours } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      if (!openingHours) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Opening hours are required",
        });
      }

      const branch = await Branch.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!branch) {
        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Branch not found",
        });
      }

      branch.openingHours =
        typeof openingHours === "string"
          ? JSON.parse(openingHours)
          : openingHours;

      await branch.save();

      return res.status(statusCode.SUCCESS).json({
        status: true,
        message:
          "Opening hours updated successfully",
        data: branch.openingHours,
      });

    } catch (error) {
      console.error(
        "Update Opening Hours Error:",
        error
      );

      return res.status(statusCode.SERVER_ERROR).json({
        status: false,
        message: "Failed to update opening hours",
        error: error.message,
      });
    }
  }
}

module.exports = new BranchController();