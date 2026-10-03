const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const menuCategoryController = require("../../controller/menuCategory/menu.category.controller");
const upload = require("../../middleware/upload");


// ============================================================
// MENU CATEGORY ROUTES
// ============================================================


// ------------------------------------------------------------
// Create Category
// ADMIN + MANAGER
// ------------------------------------------------------------

router.post(
  "/branches/:branchId/menu-categories",
  Auth,
  authorize("admin", "manager"),
  upload.cleanupLocalFiles,
  upload.single("image"),
  menuCategoryController.createCategory
);



// ------------------------------------------------------------
// Get All Categories
// ADMIN + MANAGER + STAFF
// ------------------------------------------------------------

router.get(
  "/branches/:branchId/menu-categories",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  menuCategoryController.getCategories
);


// ------------------------------------------------------------
// Get Category By ID
// ADMIN + MANAGER + STAFF
// ------------------------------------------------------------

router.get(
  "/menu-categories/:id",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  menuCategoryController.getCategoryById
);


// ------------------------------------------------------------
// Update Category
// ADMIN + MANAGER
// ------------------------------------------------------------

router.patch(
  "/menu-categories/:id",
  Auth,
  authorize("admin", "manager"),
  upload.cleanupLocalFiles,
  upload.single("image"),
  menuCategoryController.updateCategory
);


// ------------------------------------------------------------
// Soft Delete Category
// ADMIN + MANAGER
// ------------------------------------------------------------

router.patch(
  "/menu-categories/:id/soft-delete",
  Auth,
  authorize("admin", "manager"),
  menuCategoryController.softDeleteCategory
);


// ------------------------------------------------------------
// Restore Category
// ADMIN + MANAGER
// ------------------------------------------------------------

router.patch(
  "/menu-categories/:id/restore",
  Auth,
  authorize("admin", "manager"),
  menuCategoryController.restore
);


// ------------------------------------------------------------
// Hard Delete Category
// ADMIN ONLY
// ------------------------------------------------------------

router.delete(
  "/menu-categories/:id/hard-delete",
  Auth,
  authorize("admin"),
  menuCategoryController.hardDeleteCategory
);


// ------------------------------------------------------------
// Activate Category
// ADMIN + MANAGER
// ------------------------------------------------------------

router.patch(
  "/menu-categories/:id/activate",
  Auth,
  authorize("admin", "manager"),
  menuCategoryController.activateCategory
);


// ------------------------------------------------------------
// Deactivate Category
// ADMIN + MANAGER
// ------------------------------------------------------------

router.patch(
  "/menu-categories/:id/deactivate",
  Auth,
  authorize("admin", "manager"),
  menuCategoryController.deactivateCategory
);


// ------------------------------------------------------------
// Get Category Menu Items
// ADMIN + MANAGER + STAFF
// ------------------------------------------------------------

router.get(
  "/menu-categories/:id/menu-items",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  menuCategoryController.getCategoryMenuItems
);


module.exports = router;