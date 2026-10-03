const mongoose = require("mongoose");

const Review = require("../../models/review.model");

const StatusCode = require("../../utils/statusCode");
const { isValidId } = require("../../utils/validation/validation");

class ReviewController {
  // ============================================================
  // CREATE REVIEW
  // ============================================================

  async createReview(req, res) {
    try {
      const {
        customer,
        restaurant,
        branch,
        menuItem,
        rating,
        comment,
      } = req.body;

      // --------------------------------------------------------
      // Required fields
      // --------------------------------------------------------

      if (!customer || !restaurant || rating === undefined) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "customer, restaurant and rating are required",
        });
      }

      // --------------------------------------------------------
      // Validate IDs
      // --------------------------------------------------------

      if (!isValidId(customer)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      if (!isValidId(restaurant)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      if (branch && !isValidId(branch)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid branch ID",
        });
      }

      if (menuItem && !isValidId(menuItem)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      // --------------------------------------------------------
      // Validate rating
      // --------------------------------------------------------

      if (rating < 1 || rating > 5) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Rating must be between 1 and 5",
        });
      }

      // --------------------------------------------------------
      // Create review
      // --------------------------------------------------------

      const review = await Review.create({
        customer,
        restaurant,
        branch,
        menuItem,
        rating,
        comment,
      });

      return res.status(StatusCode.CREATED).json({
        status: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      console.error("createReview error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET REVIEWS
  // ============================================================

  async getReviews(req, res) {
    try {
      const {
        restaurant,
        branch,
        customer,
        menuItem,
        status,
        rating,
        page = 1,
        limit = 10,
      } = req.query;

      const currentPage = Math.max(Number(page), 1);
      const perPage = Math.max(Number(limit), 1);
      const skip = (currentPage - 1) * perPage;

      const matchStage = {
        isDeleted: false,
      };

      // --------------------------------------------------------
      // Filters
      // --------------------------------------------------------

      if (restaurant) {
        if (!isValidId(restaurant)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid restaurant ID",
          });
        }

        matchStage.restaurant =
          new mongoose.Types.ObjectId(restaurant);
      }

      if (branch) {
        if (!isValidId(branch)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        matchStage.branch =
          new mongoose.Types.ObjectId(branch);
      }

      if (customer) {
        if (!isValidId(customer)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid customer ID",
          });
        }

        matchStage.customer =
          new mongoose.Types.ObjectId(customer);
      }

      if (menuItem) {
        if (!isValidId(menuItem)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid menu item ID",
          });
        }

        matchStage.menuItem =
          new mongoose.Types.ObjectId(menuItem);
      }

      if (status) {
        matchStage.status = status;
      }

      if (rating) {
        matchStage.rating = Number(rating);
      }

      // --------------------------------------------------------
      // Aggregation
      // --------------------------------------------------------

      const result = await Review.aggregate([
        {
          $match: matchStage,
        },

        // Customer
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },

        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Restaurant
        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurant",
          },
        },

        {
          $unwind: {
            path: "$restaurant",
            preserveNullAndEmptyArrays: true,
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

        // Menu Item
        {
          $lookup: {
            from: "menuitems",
            localField: "menuItem",
            foreignField: "_id",
            as: "menuItem",
          },
        },

        {
          $unwind: {
            path: "$menuItem",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Moderator
        {
          $lookup: {
            from: "users",
            localField: "moderatedBy",
            foreignField: "_id",
            as: "moderatedBy",
          },
        },

        {
          $unwind: {
            path: "$moderatedBy",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },

        {
          $facet: {
            data: [
              {
                $skip: skip,
              },

              {
                $limit: perPage,
              },

              {
                $project: {
                  rating: 1,
                  comment: 1,
                  status: 1,
                  createdAt: 1,
                  updatedAt: 1,

                  customer: {
                    _id: "$customer._id",
                    name: "$customer.name",
                    email: "$customer.email",
                  },

                  restaurant: {
                    _id: "$restaurant._id",
                    name: "$restaurant.name",
                  },

                  branch: {
                    _id: "$branch._id",
                    name: "$branch.name",
                    branchCode: "$branch.branchCode",
                  },

                  menuItem: {
                    _id: "$menuItem._id",
                    name: "$menuItem.name",
                    price: "$menuItem.price",
                  },

                  moderatedBy: {
                    _id: "$moderatedBy._id",
                    name: "$moderatedBy.name",
                    email: "$moderatedBy.email",
                  },

                  moderatedAt: 1,
                },
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

      const reviews = result[0]?.data || [];
      const total = result[0]?.total[0]?.count || 0;

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Reviews fetched successfully",
        data: reviews,
        pagination: {
          total,
          page: currentPage,
          limit: perPage,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      console.error("getReviews error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET REVIEW BY ID
  // ============================================================

  async getReviewById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid review ID",
        });
      }

      const reviews = await Review.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            isDeleted: false,
          },
        },

        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },

        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "restaurants",
            localField: "restaurant",
            foreignField: "_id",
            as: "restaurant",
          },
        },

        {
          $unwind: {
            path: "$restaurant",
            preserveNullAndEmptyArrays: true,
          },
        },

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

        {
          $lookup: {
            from: "menuitems",
            localField: "menuItem",
            foreignField: "_id",
            as: "menuItem",
          },
        },

        {
          $unwind: {
            path: "$menuItem",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "moderatedBy",
            foreignField: "_id",
            as: "moderatedBy",
          },
        },

        {
          $unwind: {
            path: "$moderatedBy",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            rating: 1,
            comment: 1,
            status: 1,
            moderatedAt: 1,
            createdAt: 1,
            updatedAt: 1,

            customer: {
              _id: "$customer._id",
              name: "$customer.name",
              email: "$customer.email",
            },

            restaurant: {
              _id: "$restaurant._id",
              name: "$restaurant.name",
            },

            branch: {
              _id: "$branch._id",
              name: "$branch.name",
              branchCode: "$branch.branchCode",
            },

            menuItem: {
              _id: "$menuItem._id",
              name: "$menuItem.name",
              price: "$menuItem.price",
            },

            moderatedBy: {
              _id: "$moderatedBy._id",
              name: "$moderatedBy.name",
              email: "$moderatedBy.email",
            },
          },
        },
      ]);

      if (reviews.length === 0) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Review not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Review fetched successfully",
        data: reviews[0],
      });
    } catch (error) {
      console.error("getReviewById error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE REVIEW
  // ============================================================

  async updateReview(req, res) {
    try {
      const { id } = req.params;

      const {
        rating,
        comment,
      } = req.body;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid review ID",
        });
      }

      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Rating must be between 1 and 5",
          });
        }
      }

      const updateData = {};

      if (rating !== undefined) {
        updateData.rating = rating;
      }

      if (comment !== undefined) {
        updateData.comment = comment;
      }

      // Updating review makes it pending again
      updateData.status = "pending";
      updateData.moderatedBy = null;
      updateData.moderatedAt = null;

      const review = await Review.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!review) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Review not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error) {
      console.error("updateReview error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // SOFT DELETE
  // ============================================================

  async softDeleteReview(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid review ID",
        });
      }

      const review = await Review.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );

      if (!review) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Review not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Review soft deleted successfully",
      });
    } catch (error) {
      console.error("softDeleteReview error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // HARD DELETE
  // ============================================================

  async hardDeleteReview(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid review ID",
        });
      }

      const review = await Review.findByIdAndDelete(id);

      if (!review) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Review not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Review permanently deleted successfully",
      });
    } catch (error) {
      console.error("hardDeleteReview error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // RESTORE
  // ============================================================

  async restoreReview(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid review ID",
        });
      }

      const review = await Review.findOneAndUpdate(
        {
          _id: id,
          isDeleted: true,
        },
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
          },
        },
        {
          new: true,
        }
      );

      if (!review) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Deleted review not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Review restored successfully",
        data: review,
      });
    } catch (error) {
      console.error("restoreReview error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // APPROVE REVIEW
  // ============================================================

  async approveReview(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid review ID",
        });
      }

      const review = await Review.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            status: "approved",
            moderatedBy: req.user?._id || req.user?.id,
            moderatedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );

      if (!review) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Review not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Review approved successfully",
        data: review,
      });
    } catch (error) {
      console.error("approveReview error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // REJECT REVIEW
  // ============================================================

  async rejectReview(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid review ID",
        });
      }

      const review = await Review.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            status: "rejected",
            moderatedBy: req.user?._id || req.user?.id,
            moderatedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );

      if (!review) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Review not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Review rejected successfully",
        data: review,
      });
    } catch (error) {
      console.error("rejectReview error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET RESTAURANT REVIEWS
  // ============================================================

  async getRestaurantReviews(req, res) {
    try {
      const { restaurantId } = req.params;

      if (!isValidId(restaurantId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      const reviews = await Review.aggregate([
        {
          $match: {
            restaurant:
              new mongoose.Types.ObjectId(restaurantId),
            status: "approved",
            isDeleted: false,
          },
        },

        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },

        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },

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

        {
          $lookup: {
            from: "menuitems",
            localField: "menuItem",
            foreignField: "_id",
            as: "menuItem",
          },
        },

        {
          $unwind: {
            path: "$menuItem",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            rating: 1,
            comment: 1,
            createdAt: 1,

            customer: {
              _id: "$customer._id",
              name: "$customer.name",
            },

            branch: {
              _id: "$branch._id",
              name: "$branch.name",
            },

            menuItem: {
              _id: "$menuItem._id",
              name: "$menuItem.name",
            },
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Restaurant reviews fetched successfully",
        data: reviews,
      });
    } catch (error) {
      console.error("getRestaurantReviews error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET MENU ITEM REVIEWS
  // ============================================================

  async getMenuItemReviews(req, res) {
    try {
      const { menuItemId } = req.params;

      if (!isValidId(menuItemId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid menu item ID",
        });
      }

      const reviews = await Review.aggregate([
        {
          $match: {
            menuItem:
              new mongoose.Types.ObjectId(menuItemId),
            status: "approved",
            isDeleted: false,
          },
        },

        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },

        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            rating: 1,
            comment: 1,
            createdAt: 1,

            customer: {
              _id: "$customer._id",
              name: "$customer.name",
            },
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Menu item reviews fetched successfully",
        data: reviews,
      });
    } catch (error) {
      console.error("getMenuItemReviews error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET AVERAGE RATING
  // ============================================================

  async getAverageRating(req, res) {
    try {
      const { restaurantId } = req.params;

      if (!isValidId(restaurantId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      const result = await Review.aggregate([
        {
          $match: {
            restaurant:
              new mongoose.Types.ObjectId(restaurantId),
            status: "approved",
            isDeleted: false,
          },
        },

        {
          $group: {
            _id: null,

            averageRating: {
              $avg: "$rating",
            },

            totalReviews: {
              $sum: 1,
            },
          },
        },

        {
          $project: {
            _id: 0,
            averageRating: {
              $round: ["$averageRating", 2],
            },
            totalReviews: 1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Average rating fetched successfully",
        data: result[0] || {
          averageRating: 0,
          totalReviews: 0,
        },
      });
    } catch (error) {
      console.error("getAverageRating error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET RATING DISTRIBUTION
  // ============================================================

  async getRatingDistribution(req, res) {
    try {
      const { restaurantId } = req.params;

      if (!isValidId(restaurantId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      const result = await Review.aggregate([
        {
          $match: {
            restaurant:
              new mongoose.Types.ObjectId(restaurantId),
            status: "approved",
            isDeleted: false,
          },
        },

        {
          $group: {
            _id: "$rating",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            _id: -1,
          },
        },

        {
          $project: {
            _id: 0,
            rating: "$_id",
            count: 1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Rating distribution fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("getRatingDistribution error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // HIGHEST RATED ITEMS
  // ============================================================

  async getHighestRatedItems(req, res) {
    try {
      const { restaurantId, limit = 10 } = req.query;

      const matchStage = {
        status: "approved",
        isDeleted: false,
        menuItem: {
          $ne: null,
        },
      };

      if (restaurantId) {
        if (!isValidId(restaurantId)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid restaurant ID",
          });
        }

        matchStage.restaurant =
          new mongoose.Types.ObjectId(restaurantId);
      }

      const items = await Review.aggregate([
        {
          $match: matchStage,
        },

        {
          $group: {
            _id: "$menuItem",

            averageRating: {
              $avg: "$rating",
            },

            totalReviews: {
              $sum: 1,
            },
          },
        },

        {
          $match: {
            totalReviews: {
              $gte: 1,
            },
          },
        },

        {
          $sort: {
            averageRating: -1,
            totalReviews: -1,
          },
        },

        {
          $limit: Number(limit),
        },

        {
          $lookup: {
            from: "menuitems",
            localField: "_id",
            foreignField: "_id",
            as: "menuItem",
          },
        },

        {
          $unwind: "$menuItem",
        },

        {
          $project: {
            _id: 0,

            menuItem: {
              _id: "$menuItem._id",
              name: "$menuItem.name",
              price: "$menuItem.price",
              images: "$menuItem.images",
            },

            averageRating: {
              $round: ["$averageRating", 2],
            },

            totalReviews: 1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Highest rated items fetched successfully",
        data: items,
      });
    } catch (error) {
      console.error("getHighestRatedItems error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // LOWEST RATED ITEMS
  // ============================================================

  async getLowestRatedItems(req, res) {
    try {
      const { restaurantId, limit = 10 } = req.query;

      const matchStage = {
        status: "approved",
        isDeleted: false,
        menuItem: {
          $ne: null,
        },
      };

      if (restaurantId) {
        if (!isValidId(restaurantId)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid restaurant ID",
          });
        }

        matchStage.restaurant =
          new mongoose.Types.ObjectId(restaurantId);
      }

      const items = await Review.aggregate([
        {
          $match: matchStage,
        },

        {
          $group: {
            _id: "$menuItem",

            averageRating: {
              $avg: "$rating",
            },

            totalReviews: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            averageRating: 1,
            totalReviews: -1,
          },
        },

        {
          $limit: Number(limit),
        },

        {
          $lookup: {
            from: "menuitems",
            localField: "_id",
            foreignField: "_id",
            as: "menuItem",
          },
        },

        {
          $unwind: "$menuItem",
        },

        {
          $project: {
            _id: 0,

            menuItem: {
              _id: "$menuItem._id",
              name: "$menuItem.name",
              price: "$menuItem.price",
              images: "$menuItem.images",
            },

            averageRating: {
              $round: ["$averageRating", 2],
            },

            totalReviews: 1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Lowest rated items fetched successfully",
        data: items,
      });
    } catch (error) {
      console.error("getLowestRatedItems error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }
}



module.exports = new ReviewController();