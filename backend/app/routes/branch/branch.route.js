const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");

const authorize = require("../../middleware/authorize");

const branchController = require("../../controller/branch/branch.controller");

const upload = require("../../middleware/upload");


// ==========================================
// BRANCH MANAGEMENT
// ADMIN + MANAGER
// ==========================================


// ==========================================
// Create branch
// POST /api/branches/:restaurantId
// ==========================================

router.post(
  "/:restaurantId",
  Auth,
  authorize("admin", "manager"),
  upload.cleanupLocalFiles,
  upload.array("images", 10),
  branchController.createBranch
);


// ==========================================
// Get all branches of restaurant
// GET /api/branches/:restaurantId
// ==========================================

router.get(
  "/:restaurantId",
  Auth,
  // authorize("admin", "manager"),
  branchController.getBranches
);


// ==========================================
// Get branch by ID
// GET /api/branches/detail/:id
// ==========================================

router.get(
  "/detail/:id",
  Auth,
  // authorize("admin", "manager"),
  branchController.getBranchById
);


// ==========================================
// Update branch
// PATCH /api/branches/detail/:id
// ==========================================

router.patch(
  "/detail/:id",
  Auth,
  authorize("admin", "manager"),
  upload.cleanupLocalFiles,
  upload.array("images", 10),
  branchController.updateBranch
);


// ==========================================
// Delete branch
// SOFT DELETE
// DELETE /api/branches/detail/:id
// ==========================================

// router.delete(
//   "/detail/:id",
//   Auth,
//   authorize("admin", "manager"),
//   branchController.deleteBranch
// );


// ==========================================
// Activate branch
// PATCH /api/branches/detail/:id/activate
// ==========================================

router.patch(
  "/detail/:id/activate",
  Auth,
  authorize("admin", "manager"),
  branchController.activateBranch
);


// ==========================================
// Deactivate branch
// PATCH /api/branches/detail/:id/deactivate
// ==========================================

router.patch(
  "/detail/:id/deactivate",
  Auth,
  authorize("admin", "manager"),
  branchController.deactivateBranch
);


// ==========================================
// Soft delete branch
// PATCH /api/branches/detail/:id/soft-delete
// ==========================================

router.patch(
  "/detail/:id/soft-delete",
  Auth,
  authorize("admin", "manager"),
  branchController.softDeleteBranch
);


// ==========================================
// Restore branch
// PATCH /api/branches/detail/:id/restore
// ==========================================

router.patch(
  "/detail/:id/restore",
  Auth,
  authorize("admin", "manager"),
  branchController.restoreBranch
);


// ==========================================
// Permanently delete branch
// DELETE /api/branches/detail/:id/hard-delete
// ==========================================

router.delete(
  "/detail/:id/hard-delete",
  Auth,
  authorize("admin", "manager"),
  branchController.hardDeleteBranch
);


// ==========================================
// Get opening hours
// GET /api/branches/detail/:id/opening-hours
// ==========================================

router.get(
  "/detail/:id/opening-hours",
  Auth,
  authorize("admin", "manager"),
  branchController.getBranchOperatingHours
);


// ==========================================
// Update opening hours
// PATCH /api/branches/detail/:id/opening-hours
// ==========================================

router.patch(
  "/detail/:id/opening-hours",
  Auth,
  authorize("admin", "manager"),
  branchController.updateBranchOperatingHours
);


module.exports = router;