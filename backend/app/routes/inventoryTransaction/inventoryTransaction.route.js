const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const inventoryTransactionController = require("../../controller/inventoryTransaction/inventoryTransaction.controller");



// Stock In
router.post(
  "/inventory-transactions/stock-in",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.stockIn
);

// Stock Out
router.post(
  "/inventory-transactions/stock-out",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.stockOut
);

// Purchase Stock
router.post(
  "/inventory-transactions/purchase",
  Auth,
  authorize("admin", "manager"),
  inventoryTransactionController.purchaseStock
);

// Record Wastage
router.post(
  "/inventory-transactions/wastage",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.recordWastage
);

// Record Return
router.post(
  "/inventory-transactions/return",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.recordReturn
);

// Adjust Stock
router.post(
  "/inventory-transactions/adjust",
  Auth,
  authorize("admin", "manager"),
  inventoryTransactionController.adjustStock
);

// ============================================================
// TRANSACTION READ OPERATIONS
// ============================================================

// Get all transactions
router.get(
  "/inventory-transactions",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.getTransactions
);

// Get transaction by ID
router.get(
  "/inventory-transactions/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.getTransactionById
);

// ============================================================
// ITEM TRANSACTION HISTORY
// ============================================================

router.get(
  "/inventory-items/:inventoryItemId/transactions",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.getItemTransactionHistory
);

// ============================================================
// INVENTORY CONSUMPTION
// ============================================================

router.get(
  "/inventory-transactions/consumption",
  Auth,
  authorize("admin", "manager"),
  inventoryTransactionController.getInventoryConsumption
);

// ============================================================
// INVENTORY TRANSACTION REPORT
// ============================================================

router.get(
  "/inventory-transactions/report",
  Auth,
  authorize("admin", "manager"),
  inventoryTransactionController.getInventoryTransactionReport
);


// ============================================================
// REPORT / SPECIAL READ OPERATIONS — PUT THESE FIRST
// ============================================================

router.get(
  "/inventory-transactions/consumption",
  Auth,
  authorize("admin", "manager"),
  inventoryTransactionController.getInventoryConsumption
);

router.get(
  "/inventory-transactions/report",
  Auth,
  authorize("admin", "manager"),
  inventoryTransactionController.getInventoryTransactionReport
);

// ============================================================
// GET TRANSACTIONS
// ============================================================

router.get(
  "/inventory-transactions",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.getTransactions
);

// ============================================================
// GET TRANSACTION BY ID — KEEP THIS LAST
// ============================================================

router.get(
  "/inventory-transactions/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryTransactionController.getTransactionById
);

module.exports = router;