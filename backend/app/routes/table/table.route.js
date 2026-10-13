const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const tableController = require("../../controller/table/table.controller");


// ==========================================
// Create table
// POST /api/branches/:branchId/tables
// ==========================================

router.post(
  "/branches/:branchId/tables",
  Auth,
  authorize("admin", "manager"),
  tableController.createTable
);


// ==========================================
// Get all tables
// GET /api/branches/:branchId/tables
// ==========================================

router.get(
  "/tables",
  Auth,
  authorize("admin", "manager"),
  tableController.getAllTables
);

router.get(
  "/branches/:branchId/tables",
  Auth,
  authorize("admin", "manager"),
  tableController.getTables
);


// ==========================================
// Get available tables
// GET /api/branches/:branchId/tables/available
// ==========================================

router.get(
  "/branches/:branchId/tables/available",
  Auth,
  authorize("admin", "manager"),
  tableController.getAvailableTables
);


// ==========================================
// Check table availability
// GET /api/branches/:branchId/tables/check-availability
// ==========================================

router.get(
  "/branches/:branchId/tables/check-availability",
  Auth,
  authorize("admin", "manager"),
  tableController.checkTableAvailability
);


// ==========================================
// Table utilization
// GET /api/branches/:branchId/tables/utilization
// ==========================================

router.get(
  "/branches/:branchId/tables/utilization",
  Auth,
  authorize("admin", "manager"),
  tableController.getTableUtilization
);


// ==========================================
// Get table by ID
// GET /api/tables/:id
// ==========================================

router.get(
  "/tables/:id",
  Auth,
  authorize("admin", "manager"),
  tableController.getTableById
);


// ==========================================
// Update table
// PATCH /api/tables/:id
// ==========================================

router.patch(
  "/tables/:id",
  Auth,
  authorize("admin", "manager"),
  tableController.updateTable
);


// ==========================================
// Soft delete table
// PATCH /api/tables/:id/soft-delete
// ==========================================

router.patch(
  "/tables/:id/soft-delete",
  Auth,
  authorize("admin", "manager"),
  tableController.softDeleteTable
);


// ==========================================
// Restore table
// PATCH /api/tables/:id/restore
// ==========================================

router.patch(
  "/tables/:id/restore",
  Auth,
  authorize("admin", "manager"),
  tableController.restoreTable
);


// ==========================================
// Permanent delete
// DELETE /api/tables/:id/permanent-delete
// ==========================================

router.delete(
  "/tables/:id/permanent-delete",
  Auth,
  authorize("admin"),
  tableController.permanentDeleteTable
);


// ==========================================
// Update table status
// PATCH /api/tables/:id/status
// ==========================================

router.patch(
  "/tables/:id/status",
  Auth,
  authorize("admin", "manager"),
  tableController.updateTableStatus
);


// ==========================================
// Allocate table
// PATCH /api/tables/:id/allocate
// ==========================================

router.patch(
  "/tables/:id/allocate",
  Auth,
  authorize("admin", "manager"),
  tableController.allocateTable
);


// ==========================================
// Release table
// PATCH /api/tables/:id/release
// ==========================================

router.patch(
  "/tables/:id/release",
  Auth,
  authorize("admin", "manager"),
  tableController.releaseTable
);


module.exports = router;