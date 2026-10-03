const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const orderController = require("../../controller/order/order.controller");

// ============================================================
// CREATE ORDER
// ============================================================

router.post(
  "/orders",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.createOrder
);

// ============================================================
// GET ALL ORDERS
// ============================================================

router.get(
  "/orders",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.getOrders
);

// ============================================================
// GET ORDER HISTORY
// IMPORTANT: Put this BEFORE /orders/:id
// ============================================================

router.get(
  "/orders/customer/:customerId/history",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.getOrderHistory
);

// ============================================================
// GET BRANCH ORDERS
// ============================================================

router.get(
  "/branches/:branchId/orders",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.getBranchOrders
);

// ============================================================
// GET CUSTOMER ORDERS
// ============================================================

router.get(
  "/customers/:customerId/orders",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.getCustomerOrders
);

// ============================================================
// ORDER STATISTICS
// IMPORTANT: Put BEFORE /orders/:id
// ============================================================

router.get(
  "/orders/statistics",
  Auth,
  authorize("admin", "manager"),
  orderController.getOrderStatistics
);

// ============================================================
// GET ORDER BY ID
// ============================================================

router.get(
  "/orders/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.getOrderById
);

// ============================================================
// UPDATE ORDER
// ============================================================

router.patch(
  "/orders/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.updateOrder
);

// ============================================================
// CANCEL ORDER
// ============================================================

router.patch(
  "/orders/:id/cancel",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.cancelOrder
);

// ============================================================
// ORDER STATUS FLOW
// ============================================================

// pending → confirmed
router.patch(
  "/orders/:id/confirm",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.confirmOrder
);

// confirmed → preparing
router.patch(
  "/orders/:id/start-preparing",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.startPreparing
);

// preparing → ready
router.patch(
  "/orders/:id/ready",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.markReady
);

// ready → served
router.patch(
  "/orders/:id/served",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.markServed
);

// served → completed
router.patch(
  "/orders/:id/complete",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.completeOrder
);

// ============================================================
// PAYMENT
// ============================================================

router.patch(
  "/orders/:id/payment",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.updatePaymentStatus
);

// ============================================================
// COUPON
// ============================================================

router.patch(
  "/orders/:id/coupon",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.applyCoupon
);

// ============================================================
// CALCULATE TOTAL
// ============================================================

router.get(
  "/orders/:id/calculate-total",
  Auth,
  authorize("admin", "manager", "staff"),
  orderController.calculateOrderTotal
);

module.exports = router;