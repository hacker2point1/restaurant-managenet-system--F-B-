const fs = require("fs");
const Restaurant = require("../../models/resturant.model");
const StatusCode = require("../../utils/statusCode");
const cloudinary = require("../../config/cloudinary");
const { redisClient } = require("../../config/redis");

const uploadToCloudinary = (filePath, folder) =>
  cloudinary.uploader.upload(filePath, { folder });

const parseAddress = (address) => {
  if (typeof address !== "string" || !address.trim()) {
    return address;
  }

  try {
    return JSON.parse(address);
  } catch {
    return { street: address.trim() };
  }
};

class RestaurantController {

  // =====================================================
  // CREATE RESTAURANT
  // POST /api/restaurants
  // =====================================================

async createRestaurant(req, res) {
  try {
    const {
      name,
      description,
      address,
      branches,
      branch,
      phone,
      email,
    } = req.body;

    const branchData = branches ?? branch;
    const parsedAddress = parseAddress(address);
    const parsedBranches =
      typeof branchData === "string" && branchData.trim()
        ? JSON.parse(branchData)
        : branchData;

    // 1. Validate restaurant name
    if (!name || !name.trim()) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Restaurant name is required",
      });
    }

    // 2. Validate images
    if (!req.files || req.files.length === 0) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "At least one restaurant image is required",
      });
    }

    // 3. Check duplicate restaurant
    const existingRestaurant = await Restaurant.findOne({
      name: name.trim(),
    });

    if (existingRestaurant) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Restaurant already exists",
      });
    }

    // 4. Upload all images to Cloudinary
    const uploadedImages = [];

    for (const file of req.files) {
      const uploadedImage = await uploadToCloudinary(file.path, "restaurants");

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      uploadedImages.push({
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      });
    }

    // 5. Create restaurant
    const restaurant = await Restaurant.create({
      name: name.trim(),
      description,
      address: parsedAddress,
      phone,
      email,

      branches: parsedBranches,

      images: uploadedImages,

      isActive: true,
      createdBy: req.user.id,
    });

    // 6. Clear Redis cache
    await redisClient.del("restaurants:all");

    // 7. Response
    return res.status(StatusCode.CREATED).json({
      status: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });

  } catch (error) {
    console.error("Create Restaurant Error:", error);

    return res.status(StatusCode.SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
}


  // =====================================================
  // GET ALL RESTAURANTS
  // GET /api/restaurants
  // =====================================================

  async getRestaurants(req, res) {
    try {

      const cacheKey = "restaurants:all";

      // ---------------------------------------------
      // Check Redis
      // ---------------------------------------------

      const cachedRestaurants = await redisClient.get(cacheKey);

      if (cachedRestaurants) {

        console.log("Redis Cache HIT - Restaurants");

        const restaurants = JSON.parse(cachedRestaurants);

        return res.status(StatusCode.SUCCESS).json({
          status: true,
          message: "Restaurants fetched successfully",
          source: "redis",
          count: restaurants.length,
          data: restaurants,
        });
      }

      // ---------------------------------------------
      // Redis MISS → MongoDB
      // ---------------------------------------------

      console.log("Redis Cache MISS - Restaurants");

      const restaurants = await Restaurant.find()
        .sort({ createdAt: -1 })
        .lean();

      // ---------------------------------------------
      // Store in Redis
      // ---------------------------------------------

      await redisClient.set(
        cacheKey,
        JSON.stringify(restaurants),
        {
          EX: 60 * 5,
        }
      );

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Restaurants fetched successfully",
        source: "mongodb",
        count: restaurants.length,
        data: restaurants,
      });

    } catch (error) {
      console.error("Get Restaurants Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // =====================================================
  // GET RESTAURANT BY ID
  // GET /api/restaurants/:id
  // =====================================================

  async getRestaurantById(req, res) {
    try {

      const { id } = req.params;

      // ---------------------------------------------
      // Validate MongoDB ID
      // ---------------------------------------------

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      const cacheKey = `restaurant:${id}`;

      // ---------------------------------------------
      // Check Redis
      // ---------------------------------------------

      const cachedRestaurant = await redisClient.get(cacheKey);

      if (cachedRestaurant) {

        console.log(
          `Redis Cache HIT - Restaurant ${id}`
        );

        const restaurant = JSON.parse(cachedRestaurant);

        return res.status(StatusCode.SUCCESS).json({
          status: true,
          message: "Restaurant fetched successfully",
          source: "redis",
          data: restaurant,
        });
      }

      // ---------------------------------------------
      // Redis MISS → MongoDB
      // ---------------------------------------------

      console.log(
        `Redis Cache MISS - Restaurant ${id}`
      );

      const restaurant = await Restaurant.findById(id)
        .lean();

      if (!restaurant) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Restaurant not found",
        });
      }

      // ---------------------------------------------
      // Store in Redis
      // ---------------------------------------------

      await redisClient.set(
        cacheKey,
        JSON.stringify(restaurant),
        {
          EX: 60 * 5,
        }
      );

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Restaurant fetched successfully",
        source: "mongodb",
        data: restaurant,
      });

    } catch (error) {
      console.error("Get Restaurant By ID Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // =====================================================
  // UPDATE RESTAURANT
  // PATCH /api/restaurants/:id
  // =====================================================

async updateRestaurant(req, res) {
  try {
    const { id } = req.params;

    // ---------------------------------------------
    // Validate ID
    // ---------------------------------------------

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid restaurant ID",
      });
    }

    // ---------------------------------------------
    // Find restaurant
    // ---------------------------------------------

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(StatusCode.NOT_FOUND).json({
        status: false,
        message: "Restaurant not found",
      });
    }

    // ---------------------------------------------
    // Get form-data fields
    // ---------------------------------------------

    const {
      name,
      description,
      address,
      branches,
      branch,
      phone,
      email,
    } = req.body;

    const branchData = branches ?? branch;

    // ---------------------------------------------
    // Update Name
    // ---------------------------------------------

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Restaurant name cannot be empty",
        });
      }

      // Check duplicate restaurant name
      const existingRestaurant = await Restaurant.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingRestaurant) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Restaurant name already exists",
        });
      }

      restaurant.name = name.trim();
    }

    // ---------------------------------------------
    // Update Description
    // ---------------------------------------------

    if (description !== undefined) {
      restaurant.description = description;
    }

    // ---------------------------------------------
    // Update Address
    // ---------------------------------------------

    if (address !== undefined) {
      restaurant.address = parseAddress(address);
    }

    if (branchData !== undefined) {
      restaurant.branches =
        typeof branchData === "string" && branchData.trim()
          ? JSON.parse(branchData)
          : branchData;
    }

    // ---------------------------------------------
    // Update Phone
    // ---------------------------------------------

    if (phone !== undefined) {
      restaurant.phone = phone;
    }

    // ---------------------------------------------
    // Update Email
    // ---------------------------------------------

    if (email !== undefined) {
      restaurant.email = email;
    }

    // ---------------------------------------------
    // Update Images
    // ---------------------------------------------

    if (req.files && req.files.length > 0) {

      // ---------------------------------------------
      // Delete old images from Cloudinary
      // ---------------------------------------------

      if (restaurant.images && restaurant.images.length > 0) {
        for (const image of restaurant.images) {

          if (image.publicId) {
            try {
              await cloudinary.uploader.destroy(
                image.publicId,
                {
                  resource_type: "image",
                }
              );
            } catch (cloudinaryError) {
              console.error(
                "Old image delete error:",
                cloudinaryError
              );
            }
          }
        }
      }

      // ---------------------------------------------
      // Upload new images to Cloudinary
      // ---------------------------------------------

      const uploadedImages = [];

      for (const file of req.files) {
        try {
          const uploadedImage = await uploadToCloudinary(
            file.path,
            "restaurants"
          );

          uploadedImages.push({
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id,
          });
        } finally {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      // ---------------------------------------------
      // Replace old images with new images
      // ---------------------------------------------

      restaurant.images = uploadedImages;
    }

    // ---------------------------------------------
    // Save Restaurant
    // ---------------------------------------------

    await restaurant.save();

    // ---------------------------------------------
    // Get Updated Restaurant
    // ---------------------------------------------

    const updatedRestaurant =
      await Restaurant.findById(id).lean();

    // ---------------------------------------------
    // Invalidate Redis Cache
    // ---------------------------------------------

    await redisClient.del(`restaurant:${id}`);

    await redisClient.del("restaurants:all");

    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    return res.status(StatusCode.SUCCESS).json({
      status: true,
      message: "Restaurant updated successfully",
      data: updatedRestaurant,
    });

  } catch (error) {

    console.error(
      "Update Restaurant Error:",
      error
    );

    return res.status(StatusCode.SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
}


// =====================================================
// HARD DELETE RESTAURANT
// DELETE /api/restaurants/:id/hard-delete
// =====================================================

async hardDeleteRestaurant(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid restaurant ID",
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(StatusCode.NOT_FOUND).json({
        status: false,
        message: "Restaurant not found",
      });
    }

    // ---------------------------------------------
    // Permanently delete from MongoDB
    // ---------------------------------------------

    await Restaurant.findByIdAndDelete(id);

    // ---------------------------------------------
    // Invalidate Redis
    // ---------------------------------------------

    await redisClient.del(`restaurant:${id}`);
    await redisClient.del("restaurants:all");

    return res.status(StatusCode.SUCCESS).json({
      status: true,
      message: "Restaurant permanently deleted successfully",
    });

  } catch (error) {
    console.error("Hard Delete Restaurant Error:", error);

    return res.status(StatusCode.SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
}


  // =====================================================
  // ACTIVATE RESTAURANT
  // PATCH /api/restaurants/:id/activate
  // =====================================================

  async activateRestaurant(req, res) {
    try {

      const { id } = req.params;

      // ---------------------------------------------
      // Validate ID
      // ---------------------------------------------

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Restaurant not found",
        });
      }

      // ---------------------------------------------
      // Activate
      // ---------------------------------------------

      restaurant.isActive = true;

      await restaurant.save();

      // ---------------------------------------------
      // Invalidate Redis
      // ---------------------------------------------

      await redisClient.del(`restaurant:${id}`);

      await redisClient.del("restaurants:all");

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Restaurant activated successfully",
        data: {
          _id: restaurant._id,
          name: restaurant.name,
          isActive: restaurant.isActive,
        },
      });

    } catch (error) {
      console.error("Activate Restaurant Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // =====================================================
  // DEACTIVATE RESTAURANT
  // PATCH /api/restaurants/:id/deactivate
  // =====================================================

  async deactivateRestaurant(req, res) {
    try {

      const { id } = req.params;

      // ---------------------------------------------
      // Validate ID
      // ---------------------------------------------

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Restaurant not found",
        });
      }

      // ---------------------------------------------
      // Deactivate
      // ---------------------------------------------

      restaurant.isActive = false;

      await restaurant.save();

      // ---------------------------------------------
      // Invalidate Redis
      // ---------------------------------------------

      await redisClient.del(`restaurant:${id}`);

      await redisClient.del("restaurants:all");

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Restaurant deactivated successfully",
        data: {
          _id: restaurant._id,
          name: restaurant.name,
          isActive: restaurant.isActive,
        },
      });

    } catch (error) {
      console.error("Deactivate Restaurant Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }
  // =====================================================
// SOFT DELETE RESTAURANT
// PATCH /api/restaurants/:id/soft-delete
// =====================================================

async softDeleteRestaurant(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid restaurant ID",
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(StatusCode.NOT_FOUND).json({
        status: false,
        message: "Restaurant not found",
      });
    }

    // Already soft deleted
    if (restaurant.isDeleted) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Restaurant is already deleted",
      });
    }

    // Soft delete
    restaurant.isDeleted = true;
    restaurant.deletedAt = new Date();
    restaurant.isActive = false;

    await restaurant.save();

    // Invalidate Redis cache
    await redisClient.del(`restaurant:${id}`);
    await redisClient.del("restaurants:all");

    return res.status(StatusCode.SUCCESS).json({
      status: true,
      message: "Restaurant soft deleted successfully",
      data: {
        _id: restaurant._id,
        name: restaurant.name,
        isActive: restaurant.isActive,
        isDeleted: restaurant.isDeleted,
        deletedAt: restaurant.deletedAt,
      },
    });

  } catch (error) {
    console.error("Soft Delete Restaurant Error:", error);

    return res.status(StatusCode.SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
}

// =====================================================
// RESTORE RESTAURANT
// PATCH /api/restaurants/:id/restore
// =====================================================

async restoreRestaurant(req, res) {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Invalid restaurant ID",
      });
    }

    // Find restaurant including soft deleted restaurant
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(StatusCode.NOT_FOUND).json({
        status: false,
        message: "Restaurant not found",
      });
    }

    // Check whether restaurant is actually deleted
    if (!restaurant.isDeleted) {
      return res.status(StatusCode.BAD_REQUEST).json({
        status: false,
        message: "Restaurant is not deleted",
      });
    }

    // Restore restaurant
    restaurant.isDeleted = false;
    restaurant.deletedAt = null;
    restaurant.isActive = true;

    await restaurant.save();

    // Invalidate Redis cache
    await redisClient.del(`restaurant:${id}`);
    await redisClient.del("restaurants:all");

    return res.status(StatusCode.SUCCESS).json({
      status: true,
      message: "Restaurant restored successfully",
      data: {
        _id: restaurant._id,
        name: restaurant.name,
        isActive: restaurant.isActive,
        isDeleted: restaurant.isDeleted,
        deletedAt: restaurant.deletedAt,
      },
    });

  } catch (error) {
    console.error("Restore Restaurant Error:", error);

    return res.status(StatusCode.SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
}
}


module.exports = new RestaurantController();