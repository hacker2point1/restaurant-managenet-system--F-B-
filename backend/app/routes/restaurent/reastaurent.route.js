const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const restaurantController = require("../../controller/restaurant/restaurant.controller");
const upload = require("../../middleware/upload");

const publicRestaurantController = require(
  "../../controller/restaurant/publicRestaurent.controller"
);


// ==========================================
// RESTAURANT MANAGEMENT
// ADMIN + MANAGER
// ==========================================

// Create restaurant
router.post(
  "/",
  Auth,
  authorize("admin", "manager"),
  upload.cleanupLocalFiles,
  upload.array("images", 10),
  restaurantController.createRestaurant
);

// Get all restaurants
router.get(
  "/",
  Auth,
  authorize("admin", "manager"),
  restaurantController.getRestaurants
);

// Public restaurant listing
router.get(
  "/public",
  publicRestaurantController.getPublicRestaurants
);

router.get(
  "/public/:id",
  publicRestaurantController.getPublicRestaurantById
);

// Get restaurant by ID
router.get(
  "/:id",
  Auth,
  authorize("admin", "manager"),
  restaurantController.getRestaurantById
);

// Update restaurant
router.patch(
  "/:id",
  Auth,
  authorize("admin", "manager"),
  upload.cleanupLocalFiles,
  upload.array("images", 10),
  restaurantController.updateRestaurant
);

// Delete restaurant
router.delete(
  "/:id",
  Auth,
  authorize("admin", "manager"),
  restaurantController.softDeleteRestaurant
);

// Activate restaurant
router.patch(
  "/:id/activate",
  Auth,
  authorize("admin", "manager"),
  restaurantController.activateRestaurant
);

// Deactivate restaurant
router.patch(
  "/:id/deactivate",
  Auth,
  authorize("admin", "manager"),
  restaurantController.deactivateRestaurant
);

// Soft delete restaurant
// router.patch(
//   "/:id/soft-delete",
//   Auth,
//   authorize("admin", "manager"),
//   restaurantController.softDeleteRestaurant
// );

// Restore restaurant
router.patch(
  "/:id/restore",
  Auth,
  authorize("admin", "manager"),
  restaurantController.restoreRestaurant
);

// Permanently delete restaurant
router.delete(
  "/:id/hard-delete",
  Auth,
  authorize("admin", "manager"),
  restaurantController.hardDeleteRestaurant
);


module.exports = router;