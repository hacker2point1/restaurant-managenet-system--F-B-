const mongoose = require("mongoose");
const LoyaltyTransaction = require("../models/LoyaltyTransaction");
const Customer = require("../models/Customer");

// Change this path according to your project
const statusCode = require("../utils/statusCode");

class LoyaltyController {


  async getCurrentBalance(customerId, session = null) {
    const pipeline = [
      {
        $match: {
          customer: new mongoose.Types.ObjectId(customerId),
        },
      },

      {
        $sort: {
          createdAt: -1,
          _id: -1,
        },
      },

      {
        $limit: 1,
      },

      {
        $project: {
          _id: 0,
          balance: "$balanceAfter",
        },
      },
    ];

    let query = LoyaltyTransaction.aggregate(pipeline);

    if (session) {
      query = query.session(session);
    }

    const result = await query;

    return result.length > 0 ? result[0].balance : 0;
  }

  // ============================================================
  // GET LOYALTY BALANCE
  // GET /api/loyalty/:customerId/balance
  // ============================================================

  async getLoyaltyBalance(req, res) {
    try {
      const { customerId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const customerObjectId = new mongoose.Types.ObjectId(customerId);

      const result = await LoyaltyTransaction.aggregate([
        {
          $match: {
            customer: customerObjectId,
          },
        },

        {
          $facet: {
            currentBalance: [
              {
                $sort: {
                  createdAt: -1,
                  _id: -1,
                },
              },
              {
                $limit: 1,
              },
              {
                $project: {
                  _id: 0,
                  balance: "$balanceAfter",
                },
              },
            ],

            summary: [
              {
                $group: {
                  _id: null,

                  totalEarned: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "earned"] },
                        "$points",
                        0,
                      ],
                    },
                  },

                  totalRedeemed: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "redeemed"] },
                        "$points",
                        0,
                      ],
                    },
                  },

                  totalExpired: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "expired"] },
                        "$points",
                        0,
                      ],
                    },
                  },

                  totalTransactions: {
                    $sum: 1,
                  },
                },
              },
            ],
          },
        },

        {
          $project: {
            balance: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$currentBalance.balance",
                    0,
                  ],
                },
                0,
              ],
            },

            totalEarned: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$summary.totalEarned",
                    0,
                  ],
                },
                0,
              ],
            },

            totalRedeemed: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$summary.totalRedeemed",
                    0,
                  ],
                },
                0,
              ],
            },

            totalExpired: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$summary.totalExpired",
                    0,
                  ],
                },
                0,
              ],
            },

            totalTransactions: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$summary.totalTransactions",
                    0,
                  ],
                },
                0,
              ],
            },
          },
        },
      ]);

      return res.status(statusCode.OK).json({
        status: true,
        message: "Loyalty balance fetched successfully",
        data: result[0],
      });
    } catch (error) {
      console.error("Get loyalty balance error:", error);

      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch loyalty balance",
        error: error.message,
      });
    }
  }

  // ============================================================
  // EARN POINTS
  // POST /api/loyalty/:customerId/earn
  // ============================================================

  async earnPoints(req, res) {
    const session = await mongoose.startSession();

    try {
      const { customerId } = req.params;

      const {
        points,
        referenceType = "other",
        referenceId,
        description,
      } = req.body;

      // ----------------------------------------------------------
      // Validate customer ID
      // ----------------------------------------------------------

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      // ----------------------------------------------------------
      // Validate points
      // ----------------------------------------------------------

      const numericPoints = Number(points);

      if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Points must be greater than 0",
        });
      }

      // ----------------------------------------------------------
      // Validate reference ID
      // ----------------------------------------------------------

      if (
        referenceId &&
        !mongoose.Types.ObjectId.isValid(referenceId)
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid reference ID",
        });
      }

      session.startTransaction();

      // ----------------------------------------------------------
      // Check customer
      // ----------------------------------------------------------

      const customer = await Customer.findById(customerId).session(
        session
      );

      if (!customer) {
        await session.abortTransaction();

        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      // ----------------------------------------------------------
      // Get current balance
      // ----------------------------------------------------------

      const currentBalance = await this.getCurrentBalance(
        customerId,
        session
      );

      const newBalance = currentBalance + numericPoints;

      // ----------------------------------------------------------
      // Create loyalty transaction
      // ----------------------------------------------------------

      const [transaction] = await LoyaltyTransaction.create(
        [
          {
            customer: customerId,
            points: numericPoints,
            type: "earned",
            balanceAfter: newBalance,
            referenceType,
            referenceId: referenceId || undefined,
            description:
              description || `${numericPoints} loyalty points earned`,
            createdBy: req.user?._id,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return res.status(statusCode.CREATED).json({
        status: true,
        message: "Loyalty points earned successfully",
        data: {
          transaction,
          previousBalance: currentBalance,
          pointsEarned: numericPoints,
          currentBalance: newBalance,
        },
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error("Earn loyalty points error:", error);

      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to earn loyalty points",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  }

  // ============================================================
  // REDEEM POINTS
  // POST /api/loyalty/:customerId/redeem
  // ============================================================

  async redeemPoints(req, res) {
    const session = await mongoose.startSession();

    try {
      const { customerId } = req.params;

      const {
        points,
        referenceType = "other",
        referenceId,
        description,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const numericPoints = Number(points);

      if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Points must be greater than 0",
        });
      }

      if (
        referenceId &&
        !mongoose.Types.ObjectId.isValid(referenceId)
      ) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid reference ID",
        });
      }

      session.startTransaction();

      const customer = await Customer.findById(customerId).session(
        session
      );

      if (!customer) {
        await session.abortTransaction();

        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      // ----------------------------------------------------------
      // Current balance
      // ----------------------------------------------------------

      const currentBalance = await this.getCurrentBalance(
        customerId,
        session
      );

      // ----------------------------------------------------------
      // Check sufficient balance
      // ----------------------------------------------------------

      if (numericPoints > currentBalance) {
        await session.abortTransaction();

        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Insufficient loyalty points",
          data: {
            availablePoints: currentBalance,
            requestedPoints: numericPoints,
          },
        });
      }

      const newBalance = currentBalance - numericPoints;

      // ----------------------------------------------------------
      // Create redemption transaction
      // ----------------------------------------------------------

      const [transaction] = await LoyaltyTransaction.create(
        [
          {
            customer: customerId,
            points: numericPoints,
            type: "redeemed",
            balanceAfter: newBalance,
            referenceType,
            referenceId: referenceId || undefined,
            description:
              description ||
              `${numericPoints} loyalty points redeemed`,
            createdBy: req.user?._id,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return res.status(statusCode.CREATED).json({
        status: true,
        message: "Loyalty points redeemed successfully",
        data: {
          transaction,
          previousBalance: currentBalance,
          pointsRedeemed: numericPoints,
          currentBalance: newBalance,
        },
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error("Redeem loyalty points error:", error);

      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to redeem loyalty points",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  }

  // ============================================================
  // ADJUST POINTS
  // PATCH /api/loyalty/:customerId/adjust
  //
  // positive points -> add
  // negative points -> subtract
  // ============================================================

  async adjustPoints(req, res) {
    const session = await mongoose.startSession();

    try {
      const { customerId } = req.params;

      const {
        points,
        description,
        referenceType = "manual",
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const numericPoints = Number(points);

      if (!Number.isFinite(numericPoints) || numericPoints === 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Adjustment points must be a positive or negative number",
        });
      }

      if (!description) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Description is required for point adjustment",
        });
      }

      session.startTransaction();

      const customer = await Customer.findById(customerId).session(
        session
      );

      if (!customer) {
        await session.abortTransaction();

        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const currentBalance = await this.getCurrentBalance(
        customerId,
        session
      );

      const newBalance = currentBalance + numericPoints;

      // ----------------------------------------------------------
      // Prevent negative balance
      // ----------------------------------------------------------

      if (newBalance < 0) {
        await session.abortTransaction();

        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Adjustment would result in negative balance",
          data: {
            currentBalance,
            adjustment: numericPoints,
          },
        });
      }

      const [transaction] = await LoyaltyTransaction.create(
        [
          {
            customer: customerId,
            points: numericPoints,
            type: "adjusted",
            balanceAfter: newBalance,
            referenceType,
            description,
            createdBy: req.user?._id,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return res.status(statusCode.CREATED).json({
        status: true,
        message: "Loyalty points adjusted successfully",
        data: {
          transaction,
          previousBalance: currentBalance,
          adjustment: numericPoints,
          currentBalance: newBalance,
        },
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error("Adjust loyalty points error:", error);

      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to adjust loyalty points",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  }

  // ============================================================
  // GET LOYALTY HISTORY
  // GET /api/loyalty/:customerId/history
  // ============================================================


  async getLoyaltyHistory(req, res) {
    try {
      const { customerId } = req.params;

      let {
        page = 1,
        limit = 10,
        type,
        startDate,
        endDate,
      } = req.query;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      page = Math.max(Number(page) || 1, 1);
      limit = Math.min(Math.max(Number(limit) || 10, 1), 100);

      const skip = (page - 1) * limit;

      const matchStage = {
        customer: new mongoose.Types.ObjectId(customerId),
      };

      // ----------------------------------------------------------
      // Filter by transaction type
      // ----------------------------------------------------------

      if (type) {
        const allowedTypes = [
          "earned",
          "redeemed",
          "adjusted",
          "expired",
        ];

        if (!allowedTypes.includes(type)) {
          return res.status(statusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid loyalty transaction type",
          });
        }

        matchStage.type = type;
      }

      // ----------------------------------------------------------
      // Date filter
      // ----------------------------------------------------------

      if (startDate || endDate) {
        matchStage.createdAt = {};

        if (startDate) {
          const parsedStartDate = new Date(startDate);

          if (Number.isNaN(parsedStartDate.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid start date",
            });
          }

          matchStage.createdAt.$gte = parsedStartDate;
        }

        if (endDate) {
          const parsedEndDate = new Date(endDate);

          if (Number.isNaN(parsedEndDate.getTime())) {
            return res.status(statusCode.BAD_REQUEST).json({
              status: false,
              message: "Invalid end date",
            });
          }

          parsedEndDate.setHours(23, 59, 59, 999);

          matchStage.createdAt.$lte = parsedEndDate;
        }
      }

      // ----------------------------------------------------------
      // Aggregation
      // ----------------------------------------------------------

      const result = await LoyaltyTransaction.aggregate([
        {
          $match: matchStage,
        },

        {
          $sort: {
            createdAt: -1,
            _id: -1,
          },
        },

        {
          $facet: {
            transactions: [
              {
                $skip: skip,
              },

              {
                $limit: limit,
              },

              // createdBy -> User
              {
                $lookup: {
                  from: "users",
                  localField: "createdBy",
                  foreignField: "_id",
                  as: "createdBy",
                },
              },

              {
                $unwind: {
                  path: "$createdBy",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $project: {
                  customer: 1,
                  points: 1,
                  type: 1,
                  balanceAfter: 1,
                  referenceType: 1,
                  referenceId: 1,
                  description: 1,
                  createdAt: 1,

                  createdBy: {
                    _id: "$createdBy._id",
                    name: "$createdBy.name",
                    email: "$createdBy.email",
                    role: "$createdBy.role",
                  },
                },
              },
            ],

            pagination: [
              {
                $count: "total",
              },
            ],

            summary: [
              {
                $group: {
                  _id: null,

                  totalEarned: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "earned"] },
                        "$points",
                        0,
                      ],
                    },
                  },

                  totalRedeemed: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "redeemed"] },
                        "$points",
                        0,
                      ],
                    },
                  },

                  totalExpired: {
                    $sum: {
                      $cond: [
                        { $eq: ["$type", "expired"] },
                        "$points",
                        0,
                      ],
                    },
                  },
                },
              },
            ],
          },
        },

        {
          $project: {
            transactions: 1,

            total: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$pagination.total",
                    0,
                  ],
                },
                0,
              ],
            },

            summary: {
              $ifNull: [
                {
                  $arrayElemAt: ["$summary", 0],
                },
                {
                  totalEarned: 0,
                  totalRedeemed: 0,
                  totalExpired: 0,
                },
              ],
            },
          },
        },
      ]);

      const data = result[0];

      const totalPages = Math.ceil(data.total / limit);

      return res.status(statusCode.OK).json({
        status: true,
        message: "Loyalty history fetched successfully",
        data: {
          transactions: data.transactions,
          summary: data.summary,

          pagination: {
            total: data.total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get loyalty history error:", error);

      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch loyalty history",
        error: error.message,
      });
    }
  }

  // ============================================================
  // EXPIRE POINTS
  // POST /api/loyalty/:customerId/expire
  // ============================================================

  async expirePoints(req, res) {
    const session = await mongoose.startSession();

    try {
      const { customerId } = req.params;

      const {
        points,
        description,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid customer ID",
        });
      }

      const numericPoints = Number(points);

      if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Points must be greater than 0",
        });
      }

      session.startTransaction();

      const customer = await Customer.findById(customerId).session(
        session
      );

      if (!customer) {
        await session.abortTransaction();

        return res.status(statusCode.NOT_FOUND).json({
          status: false,
          message: "Customer not found",
        });
      }

      const currentBalance = await this.getCurrentBalance(
        customerId,
        session
      );

      if (numericPoints > currentBalance) {
        await session.abortTransaction();

        return res.status(statusCode.BAD_REQUEST).json({
          status: false,
          message: "Cannot expire more points than available balance",
          data: {
            availablePoints: currentBalance,
            requestedExpiryPoints: numericPoints,
          },
        });
      }

      const newBalance = currentBalance - numericPoints;

      const [transaction] = await LoyaltyTransaction.create(
        [
          {
            customer: customerId,
            points: numericPoints,
            type: "expired",
            balanceAfter: newBalance,
            referenceType: "other",
            description:
              description ||
              `${numericPoints} loyalty points expired`,
            createdBy: req.user?._id,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return res.status(statusCode.CREATED).json({
        status: true,
        message: "Loyalty points expired successfully",
        data: {
          transaction,
          previousBalance: currentBalance,
          pointsExpired: numericPoints,
          currentBalance: newBalance,
        },
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      console.error("Expire loyalty points error:", error);

      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to expire loyalty points",
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  }
}

module.exports = new LoyaltyController();