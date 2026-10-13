const express = require("express");

const router = express.Router();

const analyticsController = require(
  "../../controller/analytics/analytics.controller"
);

const Auth = require(
  "../../middleware/auth.js"
);

const authorize = require(
  "../../middleware/authorize.js"
);

// ============================================================
// DASHBOARD
// ============================================================

router.get(
  "/dashboard",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getDashboard
);

// ============================================================
// OVERALL SUMMARY
// ============================================================

router.get(
  "/summary",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getSummary
);

// ============================================================
// REVENUE ANALYTICS
// ============================================================

router.get(
  "/revenue",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getRevenueAnalytics
);

router.get(
  "/revenue/daily",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getDailyRevenue
);

router.get(
  "/revenue/weekly",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getWeeklyRevenue
);

router.get(
  "/revenue/monthly",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getMonthlyRevenue
);

router.get(
  "/revenue/yearly",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getYearlyRevenue
);

router.get(
  "/revenue/by-branch",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getRevenueByBranch
);

router.get(
  "/revenue/by-payment-method",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getRevenueByPaymentMethod
);

router.get(
  "/revenue/comparison",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getRevenueComparison
);

// ============================================================
// ORDER ANALYTICS
// ============================================================

router.get(
  "/orders",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getOrderAnalytics
);

router.get(
  "/orders/status",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getOrderStatusDistribution
);

router.get(
  "/orders/payment-status",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getPaymentStatusDistribution
);

router.get(
  "/orders/peak-hours",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getPeakOrderHours
);

router.get(
  "/orders/daily-trends",
  Auth,
  authorize("admin", "manager"),
  analyticsController.getDailyOrderTrends
);

module.exports = router;