const Restaurant = require("../../models/resturant.model");
const Branch = require("../../models/branch.model");
const Table = require("../../models/table.model");
const Reservation = require("../../models/reservation.model");
const MenuCategory = require("../../models/menuCategory.model");
const MenuItem = require("../../models/menuItem.model");
const Customer = require("../../models/customer.model");
const Order = require("../../models/order.Model");
const InventoryItem = require("../../models/inventoryItem.model");
const InventoryTransaction = require("../../models/inventoryTransaction.model");
const Coupon = require("../../models/coupon.model");
const Review = require("../../models/review.model");
const LoyaltyTransaction = require("../../models/loyalityTransaction.model");

const {
  isValidObjectId,
  toObjectId,
  buildDateFilter,
  buildScopeFilter,
} = require("../../utils/analytics/analytics.utils");
const analyticsController = {

  // ============================================================
  // DASHBOARD
  // ============================================================

  async getDashboard(req, res) {
    try {
      const {
        restaurantId,
        branchId,
        startDate,
        endDate,
      } = req.query;

      // ----------------------------------------------------------
      // Build common filters
      // ----------------------------------------------------------

      const restaurantFilter = buildScopeFilter({
        restaurantId,
      });

      const branchFilter = buildScopeFilter({
        restaurantId,
        branchId,
      });

      // ----------------------------------------------------------
      // Date filters
      // ----------------------------------------------------------

      const orderDateFilter = buildDateFilter(
        startDate,
        endDate
      );

      const reservationDateFilter = buildDateFilter(
        startDate,
        endDate
      );

      const reviewDateFilter = buildDateFilter(
        startDate,
        endDate
      );

      const inventoryDateFilter = buildDateFilter(
        startDate,
        endDate
      );

      // ==========================================================
      // 1. RESTAURANT COUNT
      // ==========================================================

      const restaurantPromise = Restaurant.countDocuments({
        ...restaurantFilter,
        isDeleted: false,
        isActive: true,
      });

      // ==========================================================
      // 2. BRANCH COUNT
      // ==========================================================

      const branchPromise = Branch.countDocuments({
        ...branchFilter,
        isDeleted: false,
        isActive: true,
      });

      // ==========================================================
      // 3. CUSTOMER COUNT
      // ==========================================================

      const customerPromise = Customer.countDocuments({
        isDeleted: false,
        isActive: true,
      });

      // ==========================================================
      // 4. MENU ITEM COUNT
      // ==========================================================

      const menuItemPromise = MenuItem.countDocuments({
        ...branchFilter,
        isDeleted: false,
        isAvailable: true,
      });

      // ==========================================================
      // 5. TABLE COUNT
      // ==========================================================

      const tablePromise = Table.countDocuments({
        ...branchFilter,
        isDeleted: false,
        isActive: true,
      });

      // ==========================================================
      // 6. INVENTORY LOW STOCK
      // ==========================================================

      const lowStockPromise = InventoryItem.countDocuments({
        ...branchFilter,
        isDeleted: false,
        isActive: true,
        $expr: {
          $lte: [
            "$currentQuantity",
            "$minimumStock",
          ],
        },
      });

      // ==========================================================
      // 7. ORDER ANALYTICS
      // ==========================================================

      const orderPromise = Order.aggregate([
        {
          $match: {
            ...branchFilter,
            ...(
              Object.keys(orderDateFilter).length > 0
                ? { orderedAt: orderDateFilter }
                : {}
            ),
          },
        },

        {
          $facet: {

            // ----------------------------------------------------
            // Total orders
            // ----------------------------------------------------

            totalOrders: [
              {
                $count: "count",
              },
            ],

            // ----------------------------------------------------
            // Completed orders
            // ----------------------------------------------------

            completedOrders: [
              {
                $match: {
                  status: "completed",
                },
              },
              {
                $count: "count",
              },
            ],

            // ----------------------------------------------------
            // Revenue
            // ----------------------------------------------------

            revenue: [
              {
                $match: {
                  status: "completed",
                  paymentStatus: "paid",
                },
              },

              {
                $group: {
                  _id: null,

                  totalRevenue: {
                    $sum: "$totalAmount",
                  },

                  totalDiscount: {
                    $sum: "$discount",
                  },

                  totalTax: {
                    $sum: "$tax",
                  },

                  averageOrderValue: {
                    $avg: "$totalAmount",
                  },
                },
              },
            ],

            // ----------------------------------------------------
            // Order status
            // ----------------------------------------------------

            orderStatus: [
              {
                $group: {
                  _id: "$status",
                  count: {
                    $sum: 1,
                  },
                },
              },

              {
                $sort: {
                  count: -1,
                },
              },
            ],
          },
        },
      ]);

      // ==========================================================
      // 8. RESERVATION ANALYTICS
      // ==========================================================

      const reservationPromise = Reservation.aggregate([
        {
          $match: {
            ...branchFilter,
            ...(
              Object.keys(reservationDateFilter).length > 0
                ? {
                    reservationDate:
                      reservationDateFilter,
                  }
                : {}
            ),
          },
        },

        {
          $facet: {

            totalReservations: [
              {
                $count: "count",
              },
            ],

            confirmedReservations: [
              {
                $match: {
                  status: "confirmed",
                },
              },
              {
                $count: "count",
              },
            ],

            completedReservations: [
              {
                $match: {
                  status: "completed",
                },
              },
              {
                $count: "count",
              },
            ],

            cancelledReservations: [
              {
                $match: {
                  status: "cancelled",
                },
              },
              {
                $count: "count",
              },
            ],

            noShowReservations: [
              {
                $match: {
                  status: "no-show",
                },
              },
              {
                $count: "count",
              },
            ],

            totalGuests: [
              {
                $group: {
                  _id: null,

                  totalGuests: {
                    $sum: "$guestCount",
                  },

                  averageGuests: {
                    $avg: "$guestCount",
                  },
                },
              },
            ],
          },
        },
      ]);

      // ==========================================================
      // 9. REVIEW ANALYTICS
      // ==========================================================

      const reviewPromise = Review.aggregate([
        {
          $match: {
            ...(
              Object.keys(restaurantFilter).length > 0
                ? restaurantFilter
                : {}
            ),

            ...(
              Object.keys(reviewDateFilter).length > 0
                ? {
                    createdAt: reviewDateFilter,
                  }
                : {}
            ),

            status: "approved",
            isDeleted: false,
          },
        },

        {
          $facet: {

            totalReviews: [
              {
                $count: "count",
              },
            ],

            averageRating: [
              {
                $group: {
                  _id: null,

                  averageRating: {
                    $avg: "$rating",
                  },
                },
              },
            ],

            ratingDistribution: [
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
                  _id: 1,
                },
              },
            ],
          },
        },
      ]);

      // ==========================================================
      // 10. INVENTORY ANALYTICS
      // ==========================================================

      const inventoryPromise =
        InventoryTransaction.aggregate([
          {
            $match: {
              ...branchFilter,

              ...(
                Object.keys(inventoryDateFilter).length > 0
                  ? {
                      transactionDate:
                        inventoryDateFilter,
                    }
                  : {}
              ),
            },
          },

          {
            $facet: {

              stockIn: [
                {
                  $match: {
                    type: {
                      $in: [
                        "purchase",
                        "stock-in",
                        "return",
                      ],
                    },
                  },
                },

                {
                  $group: {
                    _id: null,

                    quantity: {
                      $sum: "$quantity",
                    },

                    transactionCount: {
                      $sum: 1,
                    },
                  },
                },
              ],

              stockOut: [
                {
                  $match: {
                    type: "stock-out",
                  },
                },

                {
                  $group: {
                    _id: null,

                    quantity: {
                      $sum: "$quantity",
                    },

                    transactionCount: {
                      $sum: 1,
                    },
                  },
                },
              ],

              wastage: [
                {
                  $match: {
                    type: "wastage",
                  },
                },

                {
                  $group: {
                    _id: null,

                    quantity: {
                      $sum: "$quantity",
                    },

                    transactionCount: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ]);

      // ==========================================================
      // EXECUTE ALL ANALYTICS IN PARALLEL
      // ==========================================================

      const [
        restaurantCount,
        branchCount,
        customerCount,
        menuItemCount,
        tableCount,
        lowStockCount,
        orderAnalytics,
        reservationAnalytics,
        reviewAnalytics,
        inventoryAnalytics,
      ] = await Promise.all([
        restaurantPromise,
        branchPromise,
        customerPromise,
        menuItemPromise,
        tablePromise,
        lowStockPromise,
        orderPromise,
        reservationPromise,
        reviewPromise,
        inventoryPromise,
      ]);

      // ==========================================================
      // EXTRACT ORDER RESULTS
      // ==========================================================

      const orderResult =
        orderAnalytics[0] || {};

      const totalOrders =
        orderResult.totalOrders?.[0]?.count || 0;

      const completedOrders =
        orderResult.completedOrders?.[0]?.count || 0;

      const revenue =
        orderResult.revenue?.[0] || {
          totalRevenue: 0,
          totalDiscount: 0,
          totalTax: 0,
          averageOrderValue: 0,
        };

      // ==========================================================
      // EXTRACT RESERVATION RESULTS
      // ==========================================================

      const reservationResult =
        reservationAnalytics[0] || {};

      const totalReservations =
        reservationResult.totalReservations?.[0]?.count || 0;

      const confirmedReservations =
        reservationResult.confirmedReservations?.[0]?.count || 0;

      const completedReservations =
        reservationResult.completedReservations?.[0]?.count || 0;

      const cancelledReservations =
        reservationResult.cancelledReservations?.[0]?.count || 0;

      const noShowReservations =
        reservationResult.noShowReservations?.[0]?.count || 0;

      const guestStats =
        reservationResult.totalGuests?.[0] || {
          totalGuests: 0,
          averageGuests: 0,
        };

      // ==========================================================
      // EXTRACT REVIEW RESULTS
      // ==========================================================

      const reviewResult =
        reviewAnalytics[0] || {};

      const totalReviews =
        reviewResult.totalReviews?.[0]?.count || 0;

      const averageRating =
        reviewResult.averageRating?.[0]?.averageRating || 0;

      // ==========================================================
      // EXTRACT INVENTORY RESULTS
      // ==========================================================

      const inventoryResult =
        inventoryAnalytics[0] || {};

      const stockIn =
        inventoryResult.stockIn?.[0] || {
          quantity: 0,
          transactionCount: 0,
        };

      const stockOut =
        inventoryResult.stockOut?.[0] || {
          quantity: 0,
          transactionCount: 0,
        };

      const wastage =
        inventoryResult.wastage?.[0] || {
          quantity: 0,
          transactionCount: 0,
        };

      // ==========================================================
      // FINAL RESPONSE
      // ==========================================================

      return res.status(200).json({
        status: true,

        message: "Dashboard analytics fetched successfully",

        filters: {
          restaurantId: restaurantId || null,
          branchId: branchId || null,
          startDate: startDate || null,
          endDate: endDate || null,
        },

        data: {

          // ------------------------------------------------------
          // BASIC SUMMARY
          // ------------------------------------------------------

          summary: {
            restaurants: restaurantCount,
            branches: branchCount,
            customers: customerCount,
            activeMenuItems: menuItemCount,
            tables: tableCount,
            lowStockItems: lowStockCount,
          },

          // ------------------------------------------------------
          // ORDER / REVENUE
          // ------------------------------------------------------

          orders: {
            totalOrders,
            completedOrders,

            totalRevenue:
              revenue.totalRevenue || 0,

            totalDiscount:
              revenue.totalDiscount || 0,

            totalTax:
              revenue.totalTax || 0,

            averageOrderValue:
              Number(
                revenue.averageOrderValue || 0
              ).toFixed(2),

            statusDistribution:
              orderResult.orderStatus || [],
          },

          // ------------------------------------------------------
          // RESERVATIONS
          // ------------------------------------------------------

          reservations: {
            totalReservations,
            confirmedReservations,
            completedReservations,
            cancelledReservations,
            noShowReservations,

            totalGuests:
              guestStats.totalGuests || 0,

            averageGuests:
              Number(
                guestStats.averageGuests || 0
              ).toFixed(2),
          },

          // ------------------------------------------------------
          // REVIEWS
          // ------------------------------------------------------

          reviews: {
            totalReviews,

            averageRating:
              Number(averageRating).toFixed(2),

            ratingDistribution:
              reviewResult.ratingDistribution || [],
          },

          // ------------------------------------------------------
          // INVENTORY
          // ------------------------------------------------------

          inventory: {
            stockInQuantity:
              stockIn.quantity || 0,

            stockOutQuantity:
              stockOut.quantity || 0,

            wastageQuantity:
              wastage.quantity || 0,

            stockInTransactions:
              stockIn.transactionCount || 0,

            stockOutTransactions:
              stockOut.transactionCount || 0,

            wastageTransactions:
              wastage.transactionCount || 0,
          },
        },
      });

    } catch (error) {
      console.error(
        "getDashboard Error:",
        error
      );

      return res.status(500).json({
        status: false,
        message: "Failed to fetch dashboard analytics",
        error: error.message,
      });
    }
  },
  // ============================================================
// OVERALL SUMMARY
// ============================================================

async getSummary(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const restaurantFilter = buildScopeFilter({
      restaurantId,
    });

    const orderDateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const [

      // ------------------------------------------
      // Restaurants
      // ------------------------------------------

      restaurants,

      // ------------------------------------------
      // Branches
      // ------------------------------------------

      branches,

      // ------------------------------------------
      // Customers
      // ------------------------------------------

      customers,

      // ------------------------------------------
      // Orders
      // ------------------------------------------

      orderStats,

      // ------------------------------------------
      // Reservations
      // ------------------------------------------

      reservations,

      // ------------------------------------------
      // Reviews
      // ------------------------------------------

      reviews,

    ] = await Promise.all([

      Restaurant.countDocuments({
        ...restaurantFilter,
        isDeleted: false,
        isActive: true,
      }),

      Branch.countDocuments({
        ...branchFilter,
        isDeleted: false,
        isActive: true,
      }),

      Customer.countDocuments({
        isDeleted: false,
        isActive: true,
      }),

      Order.aggregate([
        {
          $match: {
            ...branchFilter,

            status: "completed",
            paymentStatus: "paid",

            ...(
              Object.keys(orderDateFilter).length
                ? {
                    orderedAt:
                      orderDateFilter,
                  }
                : {}
            ),
          },
        },

        {
          $group: {
            _id: null,

            orderCount: {
              $sum: 1,
            },

            revenue: {
              $sum: "$totalAmount",
            },

            averageOrderValue: {
              $avg: "$totalAmount",
            },
          },
        },
      ]),

      Reservation.countDocuments({
        ...branchFilter,

        ...(
          Object.keys(
            buildDateFilter(
              startDate,
              endDate
            )
          ).length
            ? {
                reservationDate:
                  buildDateFilter(
                    startDate,
                    endDate
                  ),
              }
            : {}
        ),
      }),

      Review.aggregate([
        {
          $match: {
            ...restaurantFilter,

            status: "approved",
            isDeleted: false,
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

    return res.status(200).json({
      status: true,

      message: "Analytics summary fetched successfully",

      data: {
        restaurants,
        branches,
        customers,

        orders:
          orderStats[0]?.orderCount || 0,

        revenue:
          orderStats[0]?.revenue || 0,

        averageOrderValue:
          Number(
            orderStats[0]?.averageOrderValue || 0
          ).toFixed(2),

        reservations,

        reviews:
          reviews[0]?.totalReviews || 0,

        averageRating:
          Number(
            reviews[0]?.averageRating || 0
          ).toFixed(2),
      },
    });

  } catch (error) {
    console.error(
      "getSummary Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch analytics summary",
      error: error.message,
    });
  }
},
// ============================================================
// REVENUE ANALYTICS
// ============================================================

async getRevenueAnalytics(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,

      status: "completed",
      paymentStatus: "paid",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$totalAmount",
          },

          totalOrders: {
            $sum: 1,
          },

          totalSubtotal: {
            $sum: "$subtotal",
          },

          totalDiscount: {
            $sum: "$discount",
          },

          totalTax: {
            $sum: "$tax",
          },

          averageOrderValue: {
            $avg: "$totalAmount",
          },

          minimumOrderValue: {
            $min: "$totalAmount",
          },

          maximumOrderValue: {
            $max: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          totalRevenue: 1,
          totalOrders: 1,
          totalSubtotal: 1,
          totalDiscount: 1,
          totalTax: 1,

          averageOrderValue: {
            $round: [
              "$averageOrderValue",
              2,
            ],
          },

          minimumOrderValue: 1,
          maximumOrderValue: 1,
        },
      },
    ]);

    const data = result[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      totalSubtotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      averageOrderValue: 0,
      minimumOrderValue: 0,
      maximumOrderValue: 0,
    };

    return res.status(200).json({
      status: true,
      message: "Revenue analytics fetched successfully",

      filters: {
        restaurantId: restaurantId || null,
        branchId: branchId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },

      data,
    });

  } catch (error) {
    console.error(
      "getRevenueAnalytics Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch revenue analytics",
      error: error.message,
    });
  }
},
// ============================================================
// DAILY REVENUE
// ============================================================

async getDailyRevenue(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,

      status: "completed",
      paymentStatus: "paid",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orderedAt",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },

          discount: {
            $sum: "$discount",
          },

          tax: {
            $sum: "$tax",
          },
        },
      },

      {
        $project: {
          _id: 0,

          date: "$_id",

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },

          orders: 1,

          discount: {
            $round: [
              "$discount",
              2,
            ],
          },

          tax: {
            $round: [
              "$tax",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Daily revenue fetched successfully",

      filters: {
        restaurantId: restaurantId || null,
        branchId: branchId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },

      data: result,
    });

  } catch (error) {
    console.error(
      "getDailyRevenue Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch daily revenue",
      error: error.message,
    });
  }
},
// ============================================================
// WEEKLY REVENUE
// ============================================================

async getWeeklyRevenue(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,

      status: "completed",
      paymentStatus: "paid",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: {
            year: {
              $isoWeekYear: "$orderedAt",
            },

            week: {
              $isoWeek: "$orderedAt",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },

          discount: {
            $sum: "$discount",
          },

          tax: {
            $sum: "$tax",
          },
        },
      },

      {
        $project: {
          _id: 0,

          year: "$_id.year",
          week: "$_id.week",

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },

          orders: 1,

          discount: {
            $round: [
              "$discount",
              2,
            ],
          },

          tax: {
            $round: [
              "$tax",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          year: 1,
          week: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Weekly revenue fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getWeeklyRevenue Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch weekly revenue",
      error: error.message,
    });
  }
},
// ============================================================
// MONTHLY REVENUE
// ============================================================

async getMonthlyRevenue(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,

      status: "completed",
      paymentStatus: "paid",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$orderedAt",
            },

            month: {
              $month: "$orderedAt",
            },
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },

          discount: {
            $sum: "$discount",
          },

          tax: {
            $sum: "$tax",
          },
        },
      },

      {
        $project: {
          _id: 0,

          year: "$_id.year",
          month: "$_id.month",

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },

          orders: 1,

          discount: {
            $round: [
              "$discount",
              2,
            ],
          },

          tax: {
            $round: [
              "$tax",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Monthly revenue fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getMonthlyRevenue Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch monthly revenue",
      error: error.message,
    });
  }
},
// ============================================================
// YEARLY REVENUE
// ============================================================

async getYearlyRevenue(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,

      status: "completed",
      paymentStatus: "paid",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: {
            $year: "$orderedAt",
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },

          discount: {
            $sum: "$discount",
          },

          tax: {
            $sum: "$tax",
          },
        },
      },

      {
        $project: {
          _id: 0,

          year: "$_id",

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },

          orders: 1,

          discount: {
            $round: [
              "$discount",
              2,
            ],
          },

          tax: {
            $round: [
              "$tax",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          year: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Yearly revenue fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getYearlyRevenue Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch yearly revenue",
      error: error.message,
    });
  }
},
// ============================================================
// REVENUE BY BRANCH
// ============================================================

async getRevenueByBranch(req, res) {
  try {
    const {
      restaurantId,
      startDate,
      endDate,
    } = req.query;

    const restaurantFilter = buildScopeFilter({
      restaurantId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...restaurantFilter,

      status: "completed",
      paymentStatus: "paid",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: "$branch",

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },

          averageOrderValue: {
            $avg: "$totalAmount",
          },
        },
      },

      {
        $lookup: {
          from: "branches",
          localField: "_id",
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
          _id: 0,

          branchId: "$_id",

          branchName: "$branch.name",

          branchCode: "$branch.branchCode",

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },

          orders: 1,

          averageOrderValue: {
            $round: [
              "$averageOrderValue",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Branch revenue fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getRevenueByBranch Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch branch revenue",
      error: error.message,
    });
  }
},
// ============================================================
// REVENUE BY PAYMENT METHOD
// ============================================================

async getRevenueByPaymentMethod(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,

      status: "completed",
      paymentStatus: "paid",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: {
            $ifNull: [
              "$paymentMethod",
              "unknown",
            ],
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,

          paymentMethod: "$_id",

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },

          orders: 1,
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Payment method revenue fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getRevenueByPaymentMethod Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch payment method revenue",
      error: error.message,
    });
  }
},
// ============================================================
// ORDER SUMMARY
// ============================================================

async getOrderAnalytics(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $facet: {

          totalOrders: [
            {
              $count: "count",
            },
          ],

          completedOrders: [
            {
              $match: {
                status: "completed",
              },
            },

            {
              $count: "count",
            },
          ],

          cancelledOrders: [
            {
              $match: {
                status: "cancelled",
              },
            },

            {
              $count: "count",
            },
          ],

          pendingOrders: [
            {
              $match: {
                status: "pending",
              },
            },

            {
              $count: "count",
            },
          ],

          paidOrders: [
            {
              $match: {
                paymentStatus: "paid",
              },
            },

            {
              $count: "count",
            },
          ],

          failedPayments: [
            {
              $match: {
                paymentStatus: "failed",
              },
            },

            {
              $count: "count",
            },
          ],

          refundedOrders: [
            {
              $match: {
                paymentStatus: "refunded",
              },
            },

            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    const data = result[0] || {};

    return res.status(200).json({
      status: true,

      message: "Order analytics fetched successfully",

      data: {
        totalOrders:
          data.totalOrders?.[0]?.count || 0,

        completedOrders:
          data.completedOrders?.[0]?.count || 0,

        cancelledOrders:
          data.cancelledOrders?.[0]?.count || 0,

        pendingOrders:
          data.pendingOrders?.[0]?.count || 0,

        paidOrders:
          data.paidOrders?.[0]?.count || 0,

        failedPayments:
          data.failedPayments?.[0]?.count || 0,

        refundedOrders:
          data.refundedOrders?.[0]?.count || 0,
      },
    });

  } catch (error) {
    console.error(
      "getOrderAnalytics Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch order analytics",
      error: error.message,
    });
  }
},
// ============================================================
// ORDER STATUS DISTRIBUTION
// ============================================================

async getOrderStatusDistribution(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,

          status: "$_id",

          count: 1,
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Order status distribution fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getOrderStatusDistribution Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch order status distribution",
      error: error.message,
    });
  }
},
// ============================================================
// PAYMENT STATUS DISTRIBUTION
// ============================================================

async getPaymentStatusDistribution(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: "$paymentStatus",

          count: {
            $sum: 1,
          },

          amount: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          paymentStatus: "$_id",

          count: 1,

          amount: {
            $round: [
              "$amount",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Payment status distribution fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getPaymentStatusDistribution Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch payment status distribution",
      error: error.message,
    });
  }
},
// ============================================================
// PEAK ORDER HOURS
// ============================================================

async getPeakOrderHours(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,

      status: "completed",
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: {
            $hour: "$orderedAt",
          },

          orders: {
            $sum: 1,
          },

          revenue: {
            $sum: "$totalAmount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          hour: "$_id",

          orders: 1,

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          orders: -1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Peak order hours fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getPeakOrderHours Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch peak order hours",
      error: error.message,
    });
  }
},
// ============================================================
// DAILY ORDER TRENDS
// ============================================================

async getDailyOrderTrends(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const dateFilter = buildDateFilter(
      startDate,
      endDate
    );

    const matchStage = {
      ...branchFilter,
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderedAt = dateFilter;
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$orderedAt",
            },
          },

          orders: {
            $sum: 1,
          },

          completed: {
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

          cancelled: {
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

          revenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$status",
                        "completed",
                      ],
                    },
                    {
                      $eq: [
                        "$paymentStatus",
                        "paid",
                      ],
                    },
                  ],
                },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          date: "$_id",

          orders: 1,
          completed: 1,
          cancelled: 1,

          revenue: {
            $round: [
              "$revenue",
              2,
            ],
          },
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Daily order trends fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error(
      "getDailyOrderTrends Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Failed to fetch daily order trends",
      error: error.message,
    });
  }
},
// ============================================================
// REVENUE COMPARISON
// ============================================================

async getRevenueComparison(req, res) {
  try {
    const {
      restaurantId,
      branchId,
      startDate,
      endDate,
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: false,
        message:
          "startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid date range",
      });
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const duration =
      end.getTime() - start.getTime();

    const previousEnd =
      new Date(start.getTime() - 1);

    const previousStart =
      new Date(
        start.getTime() - duration - 1
      );

    const branchFilter = buildScopeFilter({
      restaurantId,
      branchId,
    });

    const result = await Order.aggregate([
      {
        $match: {
          ...branchFilter,

          status: "completed",
          paymentStatus: "paid",

          orderedAt: {
            $gte: previousStart,
            $lte: end,
          },
        },
      },

      {
        $group: {
          _id: {
            $cond: [
              {
                $gte: [
                  "$orderedAt",
                  start,
                ],
              },
              "current",
              "previous",
            ],
          },

          revenue: {
            $sum: "$totalAmount",
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $group: {
          _id: null,

          current: {
            $max: {
              $cond: [
                {
                  $eq: [
                    "$_id",
                    "current",
                  ],
                },
                {
                  revenue: "$revenue",
                  orders: "$orders",
                },
                null,
              ],
            },
          },

          previous: {
            $max: {
              $cond: [
                {
                  $eq: [
                    "$_id",
                    "previous",
                  ],
                },
                {
                  revenue: "$revenue",
                  orders: "$orders",
                },
                null,
              ],
            },
          },
        },
      },
    ]);

    const data = result[0] || {};

    const currentRevenue =
      data.current?.revenue || 0;

    const previousRevenue =
      data.previous?.revenue || 0;

    let revenueGrowth = 0;

    if (previousRevenue !== 0) {
      revenueGrowth =
        (
          (currentRevenue - previousRevenue) /
          previousRevenue
        ) *
        100;
    }

    return res.status(200).json({
      status: true,

      message:
        "Revenue comparison fetched successfully",

      data: {
        current: {
          revenue: currentRevenue,
          orders:
            data.current?.orders || 0,
        },

        previous: {
          revenue: previousRevenue,
          orders:
            data.previous?.orders || 0,
        },

        revenueGrowthPercentage:
          Number(
            revenueGrowth
          ).toFixed(2),
      },
    });

  } catch (error) {
    console.error(
      "getRevenueComparison Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message:
        "Failed to fetch revenue comparison",
      error: error.message,
    });
  }
},


};

module.exports = analyticsController;