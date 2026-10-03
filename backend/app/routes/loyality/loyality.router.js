const express = require("express");

const router = express.Router();

// const loyalityController = require("../controllers/loyalityController");

const Auth = require("../middlewares/Auth");
const authorize = require("../middlewares/authorize");
const loyalityController = require("../../controller/loyality/loyality.controller");

// ============================================================
// LOYALTY ROUTES
// ============================================================

// Get customer's current loyalty balance
router.get(
  "/loyalty/:customerId/balance",
  Auth,
  loyalityController.getLoyaltyBalance
);

// Get loyalty transaction history
router.get(
  "/loyalty/:customerId/history",
  Auth,
  loyalityController.getLoyaltyHistory
);

// Earn loyalty points
router.post(
  "/loyalty/:customerId/earn",
  Auth,
  authorize("admin", "manager"),
  loyalityController.earnPoints
);

// Redeem loyalty points
router.post(
  "/loyalty/:customerId/redeem",
  Auth,
  loyalityController.redeemPoints
);

// Manual adjustment
router.patch(
  "/loyalty/:customerId/adjust",
  Auth,
  authorize("admin", "manager"),
  loyalityController.adjustPoints
);

// Expire loyalty points
router.post(
  "/loyalty/:customerId/expire",
  Auth,
  authorize("admin", "manager"),
  loyalityController.expirePoints
);

module.exports = router;