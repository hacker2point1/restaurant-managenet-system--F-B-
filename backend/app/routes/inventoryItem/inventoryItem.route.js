const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const inventoryItemController = require(
  "../../controller/inventoryItem/inventoryItem.controller"
);


// ======================================================
// CREATE INVENTORY ITEM
// ======================================================

router.post(
  "/branches/:branchId/inventory",
  Auth,
  authorize("admin", "manager"),
  inventoryItemController.createInventoryItem
);


// ======================================================
// GET INVENTORY ITEMS
// ======================================================

router.get(
  "/branches/:branchId/inventory",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryItemController.getInventoryItems
);


// ======================================================
// LOW STOCK
// ======================================================

router.get(
  "/branches/:branchId/inventory/low-stock",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryItemController.getLowStockItems
);


// ======================================================
// EXPIRING ITEMS
// ======================================================

router.get(
  "/branches/:branchId/inventory/expiring",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryItemController.getExpiringItems
);


// ======================================================
// GET INVENTORY ITEM BY ID
// ======================================================

router.get(
  "/inventory/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  inventoryItemController.getInventoryItemById
);


// ======================================================
// UPDATE INVENTORY ITEM
// ======================================================

router.patch(
  "/inventory/:id",
  Auth,
  authorize("admin", "manager"),
  inventoryItemController.updateInventoryItem
);


// ======================================================
// SOFT DELETE
// ======================================================

router.patch(
  "/inventory/:id/soft-delete",
  Auth,
  authorize("admin", "manager"),
  inventoryItemController.softDeleteInventoryItem
);


// ======================================================
// RESTORE
// ======================================================

router.patch(
  "/inventory/:id/restore",
  Auth,
  authorize("admin", "manager"),
  inventoryItemController.restoreInventoryItem
);


// ======================================================
// HARD DELETE
// ======================================================

router.delete(
  "/inventory/:id/hard-delete",
  Auth,
  authorize("admin"),
  inventoryItemController.hardDeleteInventoryItem
);


// ======================================================
// ACTIVATE
// ======================================================

router.patch(
  "/inventory/:id/activate",
  Auth,
  authorize("admin", "manager"),
  inventoryItemController.activateInventoryItem
);


// ======================================================
// DEACTIVATE
// ======================================================

router.patch(
  "/inventory/:id/deactivate",
  Auth,
  authorize("admin", "manager"),
  inventoryItemController.deactivateInventoryItem
);


// ======================================================
// UPDATE STOCK
// ======================================================

router.patch(
  "/inventory/:id/stock",
  Auth,
  authorize("admin", "manager"),
  inventoryItemController.updateStock
);


module.exports = router;