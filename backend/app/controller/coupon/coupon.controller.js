const mongoose = require("mongoose");

const Coupon = require("../../models/coupon.model");
const Order = require("../../models/order.Model");

const StatusCode = require("../../utils/statusCode");
const { isValid: isValidId } = require("../../utils/validation/validation");

class CouponController {
  // ============================================================
  // CREATE COUPON
  // ============================================================

  async createCoupon(req, res) {
    try {
      const {
        restaurant,
        code,
        description,
        discountType,
        discountValue,
        minimumOrderAmount,
        maximumDiscountAmount,
        usageLimit,
        perCustomerLimit,
        applicableCustomers,
        applicableBranches,
        startDate,
        expiryDate,
        isActive,
      } = req.body;

      // --------------------------------------------------------
      // Required fields
      // --------------------------------------------------------

      if (
        !restaurant ||
        !code ||
        !discountType ||
        discountValue === undefined ||
        !startDate ||
        !expiryDate
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message:
            "restaurant, code, discountType, discountValue, startDate and expiryDate are required",
        });
      }

      // --------------------------------------------------------
      // Validate IDs
      // --------------------------------------------------------

      if (!isValidId(restaurant)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid restaurant ID",
        });
      }

      // --------------------------------------------------------
      // Validate discount type
      // --------------------------------------------------------

      if (!["percentage", "fixed"].includes(discountType)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "discountType must be percentage or fixed",
        });
      }

      // --------------------------------------------------------
      // Validate percentage
      // --------------------------------------------------------

      if (discountType === "percentage" && discountValue > 100) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Percentage discount cannot exceed 100",
        });
      }

      // --------------------------------------------------------
      // Validate dates
      // --------------------------------------------------------

      const start = new Date(startDate);
      const expiry = new Date(expiryDate);

      if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid startDate or expiryDate",
        });
      }

      if (expiry <= start) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "expiryDate must be greater than startDate",
        });
      }

      // --------------------------------------------------------
      // Check duplicate coupon code
      // --------------------------------------------------------

      const existingCoupon = await Coupon.aggregate([
        {
          $match: {
            restaurant: new mongoose.Types.ObjectId(restaurant),
            code: code.toUpperCase().trim(),
            isDeleted: false,
          },
        },
        {
          $limit: 1,
        },
      ]);

      if (existingCoupon.length > 0) {
        return res.status(StatusCode.CONFLICT).json({
          status: false,
          message: "Coupon with this code already exists",
        });
      }

      // --------------------------------------------------------
      // Create coupon
      // --------------------------------------------------------

      const coupon = await Coupon.create({
        restaurant,
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue,
        minimumOrderAmount: minimumOrderAmount || 0,
        maximumDiscountAmount,
        usageLimit,
        perCustomerLimit,
        applicableCustomers,
        applicableBranches,
        startDate: start,
        expiryDate: expiry,
        isActive: isActive !== undefined ? isActive : true,
      });

      return res.status(StatusCode.CREATED).json({
        status: true,
        message: "Coupon created successfully",
        data: coupon,
      });
    } catch (error) {
      console.error("createCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET COUPONS
  // ============================================================

  async getCoupons(req, res) {
    try {
      const {
  restaurant,
  branch,
  isActive,
  discountType,
  audience,
  search,
  page = 1,
  limit = 10,
} = req.query;

      const currentPage = Math.max(Number(page), 1);
      const perPage = Math.max(Number(limit), 1);
      const skip = (currentPage - 1) * perPage;

      const matchStage = {
        isDeleted: false,
      };

      if (restaurant) {
        if (!isValidId(restaurant)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid restaurant ID",
          });
        }

        matchStage.restaurant = new mongoose.Types.ObjectId(restaurant);
      }

      if (branch) {
        if (!isValidId(branch)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid branch ID",
          });
        }

        matchStage.applicableBranches =
          new mongoose.Types.ObjectId(branch);
      }

      if (isActive !== undefined) {
        matchStage.isActive = isActive === "true";
      }
      if (discountType) {
  if (!["percentage", "fixed"].includes(discountType)) {
    return res.status(StatusCode.BAD_REQUEST).json({
      status: false,
      message: "Invalid discount type",
    });
  }

  matchStage.discountType = discountType;
}

if (search && search.trim()) {
  matchStage.code = {
    $regex: search.trim(),
    $options: "i",
  };
}

if (audience === "all-customers") {
  matchStage.$or = [
    {
      applicableCustomers: {
        $size: 0,
      },
    },
    {
      applicableCustomers: {
        $exists: false,
      },
    },
  ];
}

if (audience === "specific") {
  matchStage["applicableCustomers.0"] = {
    $exists: true,
  };
}
      const result = await Coupon.aggregate([
        {
          $match: matchStage,
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

        // Branches
        {
          $lookup: {
            from: "branches",
            localField: "applicableBranches",
            foreignField: "_id",
            as: "applicableBranches",
          },
        },

        // Customers
        {
          $lookup: {
            from: "customers",
            localField: "applicableCustomers",
            foreignField: "_id",
            as: "applicableCustomers",
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
                  code: 1,
                  description: 1,
                  discountType: 1,
                  discountValue: 1,
                  minimumOrderAmount: 1,
                  maximumDiscountAmount: 1,
                  usageLimit: 1,
                  usageCount: 1,
                  perCustomerLimit: 1,
                  startDate: 1,
                  expiryDate: 1,
                  isActive: 1,

                  restaurant: {
                    _id: "$restaurant._id",
                    name: "$restaurant.name",
                  },

                  applicableBranches: {
                    $map: {
                      input: "$applicableBranches",
                      as: "branch",
                      in: {
                        _id: "$$branch._id",
                        name: "$$branch.name",
                        branchCode: "$$branch.branchCode",
                      },
                    },
                  },

                  applicableCustomers: {
                    $map: {
                      input: "$applicableCustomers",
                      as: "customer",
                      in: {
                        _id: "$$customer._id",
                        name: "$$customer.name",
                        email: "$$customer.email",
                      },
                    },
                  },

                  createdAt: 1,
                  updatedAt: 1,
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

      const coupons = result[0]?.data || [];
      const total = result[0]?.total[0]?.count || 0;

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupons fetched successfully",
        data: coupons,
        pagination: {
          total,
          page: currentPage,
          limit: perPage,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      console.error("getCoupons error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET COUPON BY ID
  // ============================================================

  async getCouponById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const coupons = await Coupon.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            isDeleted: false,
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
            localField: "applicableBranches",
            foreignField: "_id",
            as: "applicableBranches",
          },
        },

        {
          $lookup: {
            from: "customers",
            localField: "applicableCustomers",
            foreignField: "_id",
            as: "applicableCustomers",
          },
        },

        {
          $project: {
            code: 1,
            description: 1,
            discountType: 1,
            discountValue: 1,
            minimumOrderAmount: 1,
            maximumDiscountAmount: 1,
            usageLimit: 1,
            usageCount: 1,
            perCustomerLimit: 1,
            startDate: 1,
            expiryDate: 1,
            isActive: 1,

            restaurant: {
              _id: "$restaurant._id",
              name: "$restaurant.name",
            },

            applicableBranches: {
              $map: {
                input: "$applicableBranches",
                as: "branch",
                in: {
                  _id: "$$branch._id",
                  name: "$$branch.name",
                  branchCode: "$$branch.branchCode",
                },
              },
            },

            applicableCustomers: {
              $map: {
                input: "$applicableCustomers",
                as: "customer",
                in: {
                  _id: "$$customer._id",
                  name: "$$customer.name",
                  email: "$$customer.email",
                },
              },
            },

            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

      if (coupons.length === 0) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Coupon not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon fetched successfully",
        data: coupons[0],
      });
    } catch (error) {
      console.error("getCouponById error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE COUPON
  // ============================================================

  async updateCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const allowedFields = [
        "description",
        "discountType",
        "discountValue",
        "minimumOrderAmount",
        "maximumDiscountAmount",
        "usageLimit",
        "perCustomerLimit",
        "applicableCustomers",
        "applicableBranches",
        "startDate",
        "expiryDate",
        "isActive",
      ];

      const updateData = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (req.body.code !== undefined) {
        updateData.code = req.body.code.toUpperCase().trim();
      }

      if (updateData.discountType) {
        if (!["percentage", "fixed"].includes(updateData.discountType)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid discountType",
          });
        }
      }

      if (
        updateData.discountType === "percentage" &&
        Number(updateData.discountValue) > 100
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Percentage discount cannot exceed 100",
        });
      }

      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }

      if (updateData.expiryDate) {
        updateData.expiryDate = new Date(updateData.expiryDate);
      }

      // Check dates if both are provided
      if (updateData.startDate && updateData.expiryDate) {
        if (updateData.expiryDate <= updateData.startDate) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "expiryDate must be greater than startDate",
          });
        }
      }

      // Duplicate code check
      if (updateData.code) {
        const existingCoupon = await Coupon.aggregate([
          {
            $match: {
              restaurant: req.body.restaurant
                ? new mongoose.Types.ObjectId(req.body.restaurant)
                : undefined,
              code: updateData.code,
              isDeleted: false,
              _id: {
                $ne: new mongoose.Types.ObjectId(id),
              },
            },
          },
        ]);

        // Remove undefined restaurant condition if restaurant
        // wasn't supplied.
        if (!req.body.restaurant) {
          existingCoupon.splice(
            0,
            existingCoupon.length,
            ...(await Coupon.aggregate([
              {
                $match: {
                  code: updateData.code,
                  isDeleted: false,
                  _id: {
                    $ne: new mongoose.Types.ObjectId(id),
                  },
                },
              },
            ]))
          );
        }

        if (existingCoupon.length > 0) {
          return res.status(StatusCode.CONFLICT).json({
            status: false,
            message: "Coupon with this code already exists",
          });
        }
      }

      const updatedCoupon = await Coupon.findOneAndUpdate(
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

      if (!updatedCoupon) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Coupon not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon updated successfully",
        data: updatedCoupon,
      });
    } catch (error) {
      console.error("updateCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // SOFT DELETE
  // ============================================================

  async softDeleteCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const coupon = await Coupon.findOneAndUpdate(
        {
          _id: id,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            isActive: false,
          },
        },
        {
          new: true,
        }
      );

      if (!coupon) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Coupon not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon soft deleted successfully",
      });
    } catch (error) {
      console.error("softDeleteCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // HARD DELETE
  // ============================================================

  async hardDeleteCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const coupon = await Coupon.findOneAndDelete({
        _id: id,
      });

      if (!coupon) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Coupon not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon permanently deleted successfully",
      });
    } catch (error) {
      console.error("hardDeleteCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // RESTORE
  // ============================================================

  async restoreCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const coupon = await Coupon.findOneAndUpdate(
        {
          _id: id,
          isDeleted: true,
        },
        {
          $set: {
           isDeleted: false,
  deletedAt: null,
  isActive: true,
          },
        },
        {
          new: true,
        }
      );

      if (!coupon) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Deleted coupon not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon restored successfully",
        data: coupon,
      });
    } catch (error) {
      console.error("restoreCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // ACTIVATE
  // ============================================================

  async activateCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const coupon = await Coupon.findOneAndUpdate(
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

      if (!coupon) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Coupon not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon activated successfully",
        data: coupon,
      });
    } catch (error) {
      console.error("activateCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // DEACTIVATE
  // ============================================================

  async deactivateCoupon(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const coupon = await Coupon.findOneAndUpdate(
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

      if (!coupon) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Coupon not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon deactivated successfully",
        data: coupon,
      });
    } catch (error) {
      console.error("deactivateCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // VALIDATE COUPON
  // ============================================================

  async validateCoupon(req, res) {
    try {
      const {
        code,
        restaurant,
        branch,
        customer,
        orderAmount,
      } = req.body;

      if (!code || !restaurant || orderAmount === undefined) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message:
            "code, restaurant and orderAmount are required",
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

      if (customer && !isValidId(customer)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const now = new Date();

      const matchStage = {
        code: code.toUpperCase().trim(),
        restaurant: new mongoose.Types.ObjectId(restaurant),
        isActive: true,
        isDeleted: false,

        startDate: {
          $lte: now,
        },

        expiryDate: {
          $gte: now,
        },
      };

      const coupons = await Coupon.aggregate([
        {
          $match: matchStage,
        },

        // Check branch applicability
        {
          $match: {
            $or: [
              {
                applicableBranches: {
                  $size: 0,
                },
              },
              ...(branch
                ? [
                    {
                      applicableBranches:
                        new mongoose.Types.ObjectId(branch),
                    },
                  ]
                : []),
            ],
          },
        },

        // Check customer applicability
        {
          $match: {
            $or: [
              {
                applicableCustomers: {
                  $size: 0,
                },
              },
              ...(customer
                ? [
                    {
                      applicableCustomers:
                        new mongoose.Types.ObjectId(customer),
                    },
                  ]
                : []),
            ],
          },
        },

        // Usage limit
        {
          $match: {
            $or: [
              {
                usageLimit: {
                  $exists: false,
                },
              },
              {
                usageLimit: null,
              },
              {
                $expr: {
                  $lt: ["$usageCount", "$usageLimit"],
                },
              },
            ],
          },
        },

        // Minimum order amount
        {
          $match: {
            $expr: {
              $gte: [
                Number(orderAmount),
                "$minimumOrderAmount",
              ],
            },
          },
        },

        {
          $limit: 1,
        },
      ]);

      if (coupons.length === 0) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Coupon is invalid or not applicable",
        });
      }

      const coupon = coupons[0];

      let discount = 0;

      if (coupon.discountType === "percentage") {
        discount =
          (Number(orderAmount) * coupon.discountValue) / 100;

        if (
          coupon.maximumDiscountAmount !== undefined &&
          coupon.maximumDiscountAmount !== null
        ) {
          discount = Math.min(
            discount,
            coupon.maximumDiscountAmount
          );
        }
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(
        discount,
        Number(orderAmount)
      );

      const finalAmount =
        Number(orderAmount) - discount;

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon is valid",
        data: {
          couponId: coupon._id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: discount,
          orderAmount: Number(orderAmount),
          finalAmount,
        },
      });
    } catch (error) {
      console.error("validateCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // APPLY COUPON TO ORDER
  // ============================================================

  async applyCoupon(req, res) {
    try {
      const { orderId, code } = req.body;

      if (!orderId || !code) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "orderId and code are required",
        });
      }

      if (!isValidId(orderId)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid order ID",
        });
      }

      const orders = await Order.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(orderId),
          },
        },

        {
          $limit: 1,
        },
      ]);

      if (orders.length === 0) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Order not found",
        });
      }

      const order = orders[0];

      // Find valid coupon
      const coupons = await Coupon.aggregate([
        {
          $match: {
            code: code.toUpperCase().trim(),
            restaurant: order.restaurant,
            isActive: true,
            isDeleted: false,
            startDate: {
              $lte: new Date(),
            },
            expiryDate: {
              $gte: new Date(),
            },
          },
        },

        {
          $match: {
            $or: [
              {
                applicableBranches: {
                  $size: 0,
                },
              },
              {
                applicableBranches: order.branch,
              },
            ],
          },
        },

        {
          $match: {
            $or: [
              {
                applicableCustomers: {
                  $size: 0,
                },
              },
              ...(order.customer
                ? [
                    {
                      applicableCustomers:
                        order.customer,
                    },
                  ]
                : []),
            ],
          },
        },

        {
          $match: {
            $or: [
              {
                usageLimit: {
                  $exists: false,
                },
              },
              {
                usageLimit: null,
              },
              {
                $expr: {
                  $lt: ["$usageCount", "$usageLimit"],
                },
              },
            ],
          },
        },

        {
          $match: {
            $expr: {
              $gte: [
                order.subtotal,
                "$minimumOrderAmount",
              ],
            },
          },
        },

        {
          $limit: 1,
        },
      ]);

      if (coupons.length === 0) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Coupon is invalid or cannot be applied",
        });
      }

      const coupon = coupons[0];

      let discount = 0;

      if (coupon.discountType === "percentage") {
        discount =
          (order.subtotal * coupon.discountValue) / 100;

        if (
          coupon.maximumDiscountAmount !== undefined &&
          coupon.maximumDiscountAmount !== null
        ) {
          discount = Math.min(
            discount,
            coupon.maximumDiscountAmount
          );
        }
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, order.subtotal);

      const totalAmount = Math.max(
        order.subtotal - discount + order.tax,
        0
      );

      // Update order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            coupon: coupon._id,
            discount,
            totalAmount,
          },
        },
        {
          new: true,
        }
      );

      // Increase coupon usage
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: {
          usageCount: 1,
        },
      });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon applied successfully",
        data: {
          orderId: updatedOrder._id,
          coupon: coupon.code,
          discount,
          subtotal: updatedOrder.subtotal,
          tax: updatedOrder.tax,
          totalAmount: updatedOrder.totalAmount,
        },
      });
    } catch (error) {
      console.error("applyCoupon error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // GET COUPON USAGE
  // ============================================================

  async getCouponUsage(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid coupon ID",
        });
      }

      const usage = await Order.aggregate([
        {
          $match: {
            coupon: new mongoose.Types.ObjectId(id),
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
          $project: {
            orderNumber: 1,
            subtotal: 1,
            discount: 1,
            totalAmount: 1,
            status: 1,
            orderedAt: 1,

            customer: {
              _id: "$customer._id",
              name: "$customer.name",
              email: "$customer.email",
            },

            branch: {
              _id: "$branch._id",
              name: "$branch.name",
            },
          },
        },

        {
          $sort: {
            orderedAt: -1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon usage fetched successfully",
        data: usage,
      });
    } catch (error) {
      console.error("getCouponUsage error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

  // ============================================================
  // COUPON STATISTICS
  // ============================================================

  async getCouponStatistics(req, res) {
    try {
      const { restaurant } = req.query;

      const matchStage = {
        isDeleted: false,
      };

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

      const statistics = await Coupon.aggregate([
        {
          $match: matchStage,
        },

        {
          $facet: {
            // ------------------------------------------------
            // Overall statistics
            // ------------------------------------------------

            summary: [
              {
                $group: {
                  _id: null,

                  totalCoupons: {
                    $sum: 1,
                  },

                  activeCoupons: {
                    $sum: {
                      $cond: [
                        {
                          $eq: ["$isActive", true],
                        },
                        1,
                        0,
                      ],
                    },
                  },

                  totalUsage: {
                    $sum: "$usageCount",
                  },

                  totalDiscountConfigured: {
                    $sum: "$discountValue",
                  },
                },
              },
            ],

            // ------------------------------------------------
            // Discount type
            // ------------------------------------------------

            byDiscountType: [
              {
                $group: {
                  _id: "$discountType",

                  couponCount: {
                    $sum: 1,
                  },

                  totalUsage: {
                    $sum: "$usageCount",
                  },
                },
              },
            ],

            // ------------------------------------------------
            // Most used coupons
            // ------------------------------------------------

            mostUsedCoupons: [
              {
                $sort: {
                  usageCount: -1,
                },
              },

              {
                $limit: 10,
              },

              {
                $project: {
                  code: 1,
                  discountType: 1,
                  discountValue: 1,
                  usageCount: 1,
                  usageLimit: 1,
                  isActive: 1,
                },
              },
            ],

            // ------------------------------------------------
            // Expired coupons
            // ------------------------------------------------

            expiredCoupons: [
              {
                $match: {
                  expiryDate: {
                    $lt: new Date(),
                  },
                },
              },

              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      const result = statistics[0];

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Coupon statistics fetched successfully",
        data: {
          summary: result.summary[0] || {
            totalCoupons: 0,
            activeCoupons: 0,
            totalUsage: 0,
            totalDiscountConfigured: 0,
          },

          byDiscountType: result.byDiscountType,

          mostUsedCoupons: result.mostUsedCoupons,

          expiredCoupons:
            result.expiredCoupons[0]?.count || 0,
        },
      });
    } catch (error) {
      console.error("getCouponStatistics error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }
  async getDeletedCoupons(req, res) {
  try {
    const {
      restaurant,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.max(Number(limit), 1);
    const skip = (currentPage - 1) * perPage;

    const matchStage = {
      isDeleted: true,
    };

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

    if (search && search.trim()) {
      matchStage.code = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const result = await Coupon.aggregate([
      {
        $match: matchStage,
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
          localField: "applicableBranches",
          foreignField: "_id",
          as: "applicableBranches",
        },
      },

      {
        $lookup: {
          from: "customers",
          localField: "applicableCustomers",
          foreignField: "_id",
          as: "applicableCustomers",
        },
      },

      {
        $sort: {
          deletedAt: -1,
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
          ],

          total: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    const coupons = result[0]?.data || [];

    const total =
      result[0]?.total[0]?.count || 0;

    return res.status(StatusCode.SUCCESS).json({
      status: true,
      message: "Deleted coupons fetched successfully",

      data: coupons,

      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(
          total / perPage
        ),
      },
    });
  } catch (error) {
    console.error(
      "getDeletedCoupons error:",
      error
    );

    return res.status(StatusCode.SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
}
}

const couponController = new CouponController();

module.exports = couponController;