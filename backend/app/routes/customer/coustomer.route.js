const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const customerController = require(
  "../../controller/customer/customer.controller"
);

// ============================================================
// CUSTOMER CRUD
// ============================================================

// Create customer
router.post(
  "/customers",
  Auth,
  authorize("admin", "manager"),
  customerController.createCustomer
);

// Get all customers
router.get(
  "/customers",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.getCustomers
);

// Search customers
router.get(
  "/customers/search",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.searchCustomers
);

// Get customer by ID
router.get(
  "/customers/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.getCustomerById
);

// Update customer
router.patch(
  "/customers/:id",
  Auth,
  authorize("admin", "manager"),
  customerController.updateCustomer
);

// Soft delete customer
router.patch(
  "/customers/:id/soft-delete",
  Auth,
  authorize("admin", "manager"),
  customerController.softDeleteCustomer
);

// Restore customer
router.patch(
  "/customers/:id/restore",
  Auth,
  authorize("admin", "manager"),
  customerController.restoreCustomer
);

// Hard delete customer
router.delete(
  "/customers/:id/hard-delete",
  Auth,
  authorize("admin"),
  customerController.hardDeleteCustomer
);

// ============================================================
// CUSTOMER HISTORY
// ============================================================

// Customer orders
router.get(
  "/customers/:id/orders",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.getCustomerOrders
);

// Customer reservations
router.get(
  "/customers/:id/reservations",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.getCustomerReservations
);

// Customer reviews
router.get(
  "/customers/:id/reviews",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.getCustomerReviews
);

// Customer complete history
router.get(
  "/customers/:id/history",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.getCustomerHistory
);

// ============================================================
// CUSTOMER ANALYTICS
// ============================================================

// Customer spending
router.get(
  "/customers/:id/spending",
  Auth,
  authorize("admin", "manager"),
  customerController.getCustomerSpending
);

// Customer visits
router.get(
  "/customers/:id/visits",
  Auth,
  authorize("admin", "manager", "staff"),
  customerController.getCustomerVisits
);

// Customer statistics
router.get(
  "/customers/:id/statistics",
  Auth,
  authorize("admin", "manager"),
  customerController.getCustomerStatistics
);

// New customers
router.get(
  "/customers/analytics/new",
  Auth,
  authorize("admin", "manager"),
  customerController.identifyNewCustomers
);

// Returning customers
router.get(
  "/customers/analytics/returning",
  Auth,
  authorize("admin", "manager"),
  customerController.identifyReturningCustomers
);

module.exports = router;