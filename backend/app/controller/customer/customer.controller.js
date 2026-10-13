const Customer = require("../../models/customer.model");
const User = require("../../models/users.model");
const Order = require("../../models/order.Model");
const Reservation = require("../../models/customer.model");
const Review = require("../../models/review.model");

const StatusCode = require("../../utils/statusCode");
const { isValid: isValidId } = require("../../utils/validation/validation");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createPhoneSearchRegex(value) {
  const digits = value.replace(/\D/g, "");
  return digits ? new RegExp(digits.split("").join("\\D*")) : null;
}

class CustomerController {
  // ============================================================
  // CREATE CUSTOMER
  // ============================================================

  async createCustomer(req, res) {
    try {
      const {
        user,
        name,
        email,
        phone,
        address,
        loyaltyPoints,
        isActive,
      } = req.body;

      // --------------------------------------------------------
      // Required field
      // --------------------------------------------------------

      if (!name) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Customer name is required",
        });
      }

      // --------------------------------------------------------
      // Validate user ID if provided
      // --------------------------------------------------------

      if (user && !isValidId(user)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      // --------------------------------------------------------
      // Check duplicate user
      // --------------------------------------------------------

      if (user) {
        const existingUser = await Customer.findOne({
          user,
          isDeleted: false,
        });

        if (existingUser) {
          return res.status(StatusCode.CONFLICT).json({
            status: false,
            message: "Customer already exists for this user",
          });
        }
      }

      // --------------------------------------------------------
      // Create customer
      // --------------------------------------------------------

      const customer = await Customer.create({
        user: user || undefined,
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        phone: phone ? phone.trim() : undefined,
        address,
        loyaltyPoints:
          loyaltyPoints !== undefined
            ? Number(loyaltyPoints)
            : 0,
        // isActive:
        //   isActive !== undefined
        //     ? isActive === true || isActive === "true"
        //     : true,
        // isDeleted: false,
        // deletedAt: null,
      });

      return res.status(StatusCode.CREATED).json({
        status: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Create Customer Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMERS
  // ============================================================

  async getCustomers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        isActive,
        search,
      } = req.query;

      // --------------------------------------------------------
      // Filter
      // --------------------------------------------------------

      const filter = {
        isDeleted: false,
      };

      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      const searchTerm =
        typeof search === "string" ? search.trim() : "";

      if (searchTerm) {
        const searchRegex = new RegExp(escapeRegex(searchTerm), "i");
        const phoneRegex = createPhoneSearchRegex(searchTerm);
        const matchingUsers = await User.find({
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            ...(phoneRegex ? [{ phone: phoneRegex }] : []),
          ],
        }).distinct("_id");

        filter.$or = [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          ...(phoneRegex ? [{ phone: phoneRegex }] : []),
          { user: { $in: matchingUsers } },
        ];
      }

      // --------------------------------------------------------
      // Pagination
      // --------------------------------------------------------

      const pageNumber = Math.max(Number(page), 1);

      const limitNumber = Math.min(
        Math.max(Number(limit), 1),
        100
      );

      const skip =
        (pageNumber - 1) * limitNumber;

      // --------------------------------------------------------
      // Get customers
      // --------------------------------------------------------

      const [customers, total] = await Promise.all([
        Customer.find(filter)
          .populate("user", "name email phone role")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber),

        Customer.countDocuments(filter),
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customers fetched successfully",

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },

        data: customers,
      });
    } catch (error) {
      console.error("Get Customers Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER BY ID
  // ============================================================

  async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      }).populate(
        "user",
        "name email phone role"
      );

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer fetched successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Get Customer By ID Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // UPDATE CUSTOMER
  // ============================================================

  async updateCustomer(req, res) {
    try {
      const { id } = req.params;

      const {
        name,
        email,
        phone,
        address,
        loyaltyPoints,
        isActive,
      } = req.body;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      // --------------------------------------------------------
      // Update fields
      // --------------------------------------------------------

      if (name !== undefined) {
        customer.name = name.trim();
      }

      if (email !== undefined) {
        customer.email = email.trim().toLowerCase();
      }

      if (phone !== undefined) {
        customer.phone = phone.trim();
      }

      if (address !== undefined) {
        customer.address = address;
      }

      if (loyaltyPoints !== undefined) {
        customer.loyaltyPoints = Number(loyaltyPoints);
      }

      if (isActive !== undefined) {
        customer.isActive =
          isActive === true ||
          isActive === "true";
      }

      await customer.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Update Customer Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // SOFT DELETE CUSTOMER
  // ============================================================

  async softDeleteCustomer(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      customer.isDeleted = true;
      customer.deletedAt = new Date();
      customer.isActive = false;

      await customer.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer soft deleted successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Soft Delete Customer Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // HARD DELETE CUSTOMER
  // ============================================================

  async hardDeleteCustomer(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      await Customer.findByIdAndDelete(id);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer permanently deleted",
      });
    } catch (error) {
      console.error("Hard Delete Customer Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // RESTORE CUSTOMER
  // ============================================================

  async restoreCustomer(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: true,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Deleted customer not found",
        });
      }

      customer.isDeleted = false;
      customer.deletedAt = null;
      customer.isActive = true;

      await customer.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer restored successfully",
        data: customer,
      });
    } catch (error) {
      console.error("Restore Customer Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // SEARCH CUSTOMERS
  // ============================================================

  async searchCustomers(req, res) {
    try {
      const { q } = req.query;
      const searchTerm =
        typeof q === "string" ? q.trim() : "";

      if (!searchTerm) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Search query is required",
        });
      }

      const searchRegex = new RegExp(
        searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      const customers = await Customer.aggregate([
        {
          $match: {
            isDeleted: { $ne: true },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "linkedUser",
          },
        },
        {
          $unwind: {
            path: "$linkedUser",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { phone: searchRegex },
              { "linkedUser.name": searchRegex },
              { "linkedUser.email": searchRegex },
              { "linkedUser.phone": searchRegex },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
        {
          $project: {
            _id: 1,
            name: { $ifNull: ["$name", "$linkedUser.name"] },
            email: { $ifNull: ["$email", "$linkedUser.email"] },
            phone: { $ifNull: ["$phone", "$linkedUser.phone"] },
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customers searched successfully",
        count: customers.length,
        data: customers,
      });
    } catch (error) {
      console.error("Search Customers Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER ORDERS
  // ============================================================

  async getCustomerOrders(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const orders = await Order.find({
        customer: id,
      })
        .populate("restaurant", "name")
        .populate("branch", "name branchCode")
        .populate("table", "tableNumber")
        .sort({ orderedAt: -1 });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer orders fetched successfully",
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      console.error("Get Customer Orders Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER RESERVATIONS
  // ============================================================

  async getCustomerReservations(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const reservations = await Reservation.find({
        customer: id,
      })
        .populate("branch", "name branchCode")
        .populate("table", "tableNumber capacity")
        .sort({ reservationDate: -1 });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message:
          "Customer reservations fetched successfully",
        count: reservations.length,
        data: reservations,
      });
    } catch (error) {
      console.error(
        "Get Customer Reservations Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER REVIEWS
  // ============================================================

  async getCustomerReviews(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const reviews = await Review.find({
        customer: id,
      })
        .populate("restaurant", "name")
        .populate("branch", "name branchCode")
        .populate("menuItem", "name price")
        .sort({ createdAt: -1 });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer reviews fetched successfully",
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      console.error(
        "Get Customer Reviews Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER HISTORY
  // ============================================================

  async getCustomerHistory(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const [orders, reservations, reviews] =
        await Promise.all([
          Order.find({
            customer: id,
          })
            .select(
              "orderNumber totalAmount status paymentStatus orderedAt"
            )
            .sort({ orderedAt: -1 }),

          Reservation.find({
            customer: id,
          })
            .select(
              "branch table reservationDate startTime endTime guestCount status"
            )
            .sort({ reservationDate: -1 }),

          Review.find({
            customer: id,
          })
            .select(
              "restaurant branch menuItem rating comment status createdAt"
            )
            .sort({ createdAt: -1 }),
        ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer history fetched successfully",

        data: {
          orders,
          reservations,
          reviews,
        },
      });
    } catch (error) {
      console.error(
        "Get Customer History Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER SPENDING
  // ============================================================

  async getCustomerSpending(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const spending = await Order.aggregate([
        {
          $match: {
            customer: customer._id,
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: {
              $sum: 1,
            },
            totalSpent: {
              $sum: "$totalAmount",
            },
            averageOrderValue: {
              $avg: "$totalAmount",
            },
            highestOrderValue: {
              $max: "$totalAmount",
            },
            lowestOrderValue: {
              $min: "$totalAmount",
            },
          },
        },
      ]);

      const result = spending[0] || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        highestOrderValue: 0,
        lowestOrderValue: 0,
      };

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer spending fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error(
        "Get Customer Spending Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER VISITS
  // ============================================================

  async getCustomerVisits(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const reservations = await Reservation.find({
        customer: id,
        status: "completed",
      })
        .populate("branch", "name branchCode")
        .populate("table", "tableNumber")
        .sort({ reservationDate: -1 });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer visits fetched successfully",

        data: {
          totalVisits: customer.totalVisits,
          lastVisitAt: customer.lastVisitAt || null,
          completedReservations: reservations.length,
          visits: reservations,
        },
      });
    } catch (error) {
      console.error(
        "Get Customer Visits Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET CUSTOMER STATISTICS
  // ============================================================

  async getCustomerStatistics(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customer = await Customer.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!customer) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const [
        orderStats,
        reservationStats,
        reviewStats,
      ] = await Promise.all([
        Order.aggregate([
          {
            $match: {
              customer: customer._id,
            },
          },
          {
            $group: {
              _id: null,

              totalOrders: {
                $sum: 1,
              },

              completedOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "completed",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              totalSpent: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "completed",
                      ],
                    },
                    "$totalAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]),

        Reservation.aggregate([
          {
            $match: {
              customer: customer._id,
            },
          },
          {
            $group: {
              _id: null,

              totalReservations: {
                $sum: 1,
              },

              completedReservations: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "completed",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              cancelledReservations: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "cancelled",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              noShowReservations: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$status",
                        "no-show",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),

        Review.aggregate([
          {
            $match: {
              customer: customer._id,
            },
          },
          {
            $group: {
              _id: null,

              totalReviews: {
                $sum: 1,
              },

              averageRating: {
                $avg: "$rating",
              },
            },
          },
        ]),
      ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Customer statistics fetched successfully",

        data: {
          customer: {
            id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },

          customerData: {
            loyaltyPoints:
              customer.loyaltyPoints,

            totalVisits:
              customer.totalVisits,

            totalSpent:
              customer.totalSpent,

            lastVisitAt:
              customer.lastVisitAt || null,
          },

          orders:
            orderStats[0] || {
              totalOrders: 0,
              completedOrders: 0,
              totalSpent: 0,
            },

          reservations:
            reservationStats[0] || {
              totalReservations: 0,
              completedReservations: 0,
              cancelledReservations: 0,
              noShowReservations: 0,
            },

          reviews:
            reviewStats[0] || {
              totalReviews: 0,
              averageRating: 0,
            },
        },
      });
    } catch (error) {
      console.error(
        "Get Customer Statistics Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // IDENTIFY NEW CUSTOMERS
  // ============================================================

  async identifyNewCustomers(req, res) {
    try {
      const {
        days = 30,
        page = 1,
        limit = 10,
      } = req.query;

      const daysNumber = Number(days);

      if (
        !Number.isFinite(daysNumber) ||
        daysNumber < 0
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Days must be a valid number",
        });
      }

      const startDate = new Date();

      startDate.setDate(
        startDate.getDate() - daysNumber
      );

      const pageNumber = Math.max(Number(page), 1);

      const limitNumber = Math.min(
        Math.max(Number(limit), 1),
        100
      );

      const skip =
        (pageNumber - 1) * limitNumber;

      const filter = {
        isDeleted: false,
        createdAt: {
          $gte: startDate,
        },
      };

      const [customers, total] =
        await Promise.all([
          Customer.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber),

          Customer.countDocuments(filter),
        ]);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "New customers fetched successfully",

        period: {
          days: daysNumber,
          startDate,
          endDate: new Date(),
        },

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },

        data: customers,
      });
    } catch (error) {
      console.error(
        "Identify New Customers Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // IDENTIFY RETURNING CUSTOMERS
  // ============================================================

  async identifyReturningCustomers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
      } = req.query;

      const pageNumber = Math.max(Number(page), 1);

      const limitNumber = Math.min(
        Math.max(Number(limit), 1),
        100
      );

      const skip =
        (pageNumber - 1) * limitNumber;

      const customers = await Customer.find({
        isDeleted: false,
        totalVisits: {
          $gt: 1,
        },
      })
        .sort({
          totalVisits: -1,
          lastVisitAt: -1,
        })
        .skip(skip)
        .limit(limitNumber);

      const total = await Customer.countDocuments({
        isDeleted: false,
        totalVisits: {
          $gt: 1,
        },
      });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message:
          "Returning customers fetched successfully",

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },

        data: customers,
      });
    } catch (error) {
      console.error(
        "Identify Returning Customers Error:",
        error
      );

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // GET DELETED CUSTOMERS
async getDeletedCustomers(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const filter = { isDeleted: true };

    if (typeof search === "string" && search.trim()) {
      const searchTerm = search.trim();
      const regex = new RegExp(escapeRegex(searchTerm), "i");
      const phoneRegex = createPhoneSearchRegex(searchTerm);
      const matchingUsers = await User.find({
        $or: [
          { name: regex },
          { email: regex },
          { phone: regex },
          ...(phoneRegex ? [{ phone: phoneRegex }] : []),
        ],
      }).distinct("_id");

      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        ...(phoneRegex ? [{ phone: phoneRegex }] : []),
        { user: { $in: matchingUsers } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate("user", "name email phone role")
        .sort({ deletedAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Customer.countDocuments(filter),
    ]);

    return res.status(StatusCode.SUCCESS).json({
      status: true,
      message: "Deleted customers fetched successfully",
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
      data: customers,
    });
  } catch (error) {
    console.error("Get Deleted Customers Error:", error);

    return res.status(StatusCode.SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
}

module.exports= new CustomerController()