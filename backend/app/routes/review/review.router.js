const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const reviewController = require("../../controller/review/review.controller");

// ============================================================
// CREATE / GET
// ============================================================

router.post(
  "/reviews",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reviewController.createReview
);

router.get(
  "/reviews",
  Auth,
  authorize("admin", "manager", "staff"),
  reviewController.getReviews
);

// ============================================================
// SPECIFIC ROUTES MUST COME BEFORE /reviews/:id
// ============================================================

router.get(
  "/restaurants/:restaurantId/reviews",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reviewController.getRestaurantReviews
);

router.get(
  "/menu-items/:menuItemId/reviews",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reviewController.getMenuItemReviews
);

router.get(
  "/restaurants/:restaurantId/reviews/average-rating",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reviewController.getAverageRating
);

router.get(
  "/restaurants/:restaurantId/reviews/rating-distribution",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reviewController.getRatingDistribution
);

router.get(
  "/reviews/highest-rated-items",
  Auth,
  authorize("admin", "manager", "staff"),
  reviewController.getHighestRatedItems
);

router.get(
  "/reviews/lowest-rated-items",
  Auth,
  authorize("admin", "manager", "staff"),
  reviewController.getLowestRatedItems
);

// ============================================================
// REVIEW BY ID
// ============================================================

router.get(
  "/reviews/:id",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reviewController.getReviewById
);

router.patch(
  "/reviews/:id",
  Auth,
  authorize("admin", "manager", "customer"),
  reviewController.updateReview
);

// ============================================================
// MODERATION
// ============================================================

router.patch(
  "/reviews/:id/approve",
  Auth,
  authorize("admin", "manager"),
  reviewController.approveReview
);

router.patch(
  "/reviews/:id/reject",
  Auth,
  authorize("admin", "manager"),
  reviewController.rejectReview
);

// ============================================================
// RESTORE / DELETE
// ============================================================

router.patch(
  "/reviews/:id/restore",
  Auth,
  authorize("admin", "manager"),
  reviewController.restoreReview
);

router.delete(
  "/reviews/:id",
  Auth,
  authorize("admin", "manager"),
  reviewController.softDeleteReview
);

router.delete(
  "/reviews/:id/permanent",
  Auth,
  authorize("admin"),
  reviewController.hardDeleteReview
);

module.exports = router;