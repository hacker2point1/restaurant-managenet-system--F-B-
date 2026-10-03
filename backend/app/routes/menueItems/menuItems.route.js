const express = require("express");
const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");
const upload = require("../../middleware/upload");

const menuItemController = require(
  "../../controller/menuItems/menuItems.controller"
);

// CREATE
router.post(
  "/branches/:branchId/menu-items",
  Auth,
  authorize("admin", "manager"),
  upload.array("images", 5),
  menuItemController.createMenuItem
);

// GET ALL
router.get(
  "/menu-items",
  Auth,
  authorize("admin", "manager", "staff"),
  menuItemController.getMenuItems
);

// SEARCH
router.get(
  "/menu-items/search",
  Auth,
  authorize("admin", "manager", "staff"),
  menuItemController.searchMenuItems
);

// PRICE RANGE
router.get(
  "/menu-items/price-range",
  Auth,
  authorize("admin", "manager", "staff"),
  menuItemController.getItemsByPriceRange
);

// RATING
router.get(
  "/menu-items/rating",
  Auth,
  authorize("admin", "manager", "staff"),
  menuItemController.getItemsByRating
);

// POPULAR
router.get(
  "/menu-items/popular",
  Auth,
  authorize("admin", "manager", "staff"),
  menuItemController.getPopularItems
);

// ITEMS BY CATEGORY
router.get(
  "/menu-items/category/:categoryId",
  Auth,
  authorize("admin", "manager", "staff"),
  menuItemController.getItemsByCategory
);

// GET BY ID
router.get(
  "/menu-items/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  menuItemController.getMenuItemById
);

// UPDATE
router.patch(
  "/menu-items/:id",
  Auth,
  authorize("admin", "manager"),
  upload.array("images", 5),
  menuItemController.updateMenuItem
);

// SOFT DELETE
router.patch(
  "/menu-items/:id/soft-delete",
  Auth,
  authorize("admin", "manager"),
  menuItemController.softDeleteMenuItem
);

// RESTORE
router.patch(
  "/menu-items/:id/restore",
  Auth,
  authorize("admin", "manager"),
  menuItemController.restoreMenuItem
);

// HARD DELETE
router.delete(
  "/menu-items/:id/hard-delete",
  Auth,
  authorize("admin"),
  menuItemController.hardDeleteMenuItem
);

// TOGGLE AVAILABILITY
router.patch(
  "/menu-items/:id/toggle-availability",
  Auth,
  authorize("admin", "manager"),
  menuItemController.toggleAvailability
);

// TOGGLE FEATURED
router.patch(
  "/menu-items/:id/toggle-featured",
  Auth,
  authorize("admin", "manager"),
  menuItemController.toggleFeatured
);

module.exports = router;