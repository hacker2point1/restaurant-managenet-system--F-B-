const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const couponController = require("../../controller/coupon/coupon.controller");



router.post(
  "/coupons",
  Auth,
  authorize("admin", "manager"),
  couponController.createCoupon
);

router.get(
  "/coupons",
  Auth,
  authorize("admin", "manager", "staff"),
  couponController.getCoupons
);

router.get(
  "/coupons/deleted",
  Auth,
  authorize("admin", "manager"),
  couponController.getDeletedCoupons
);



router.post(
  "/coupons/validate",
  Auth,
  authorize("admin", "manager", "staff"),
  couponController.validateCoupon
);

router.post(
  "/coupons/apply",
  Auth,
  authorize("admin", "manager", "staff"),
  couponController.applyCoupon
);

router.get(
  "/coupons/statistics",
  Auth,
  authorize("admin", "manager"),
  couponController.getCouponStatistics
);



router.get(
  "/coupons/:id/usage",
  Auth,
  authorize("admin", "manager"),
  couponController.getCouponUsage
);



router.get(
  "/coupons/:id",
  Auth,
  authorize("admin", "manager", "staff"),
  couponController.getCouponById
);

router.patch(
  "/coupons/:id",
  Auth,
  authorize("admin", "manager"),
  couponController.updateCoupon
);



router.patch(
  "/coupons/:id/activate",
  Auth,
  authorize("admin", "manager"),
  couponController.activateCoupon
);

router.patch(
  "/coupons/:id/deactivate",
  Auth,
  authorize("admin", "manager"),
  couponController.deactivateCoupon
);


router.patch(
  "/coupons/:id/restore",
  Auth,
  authorize("admin", "manager"),
  couponController.restoreCoupon
);

router.delete(
  "/coupons/:id",
  Auth,
  authorize("admin", "manager"),
  couponController.softDeleteCoupon
);

router.delete(
  "/coupons/:id/permanent",
  Auth,
  authorize("admin"),
  couponController.hardDeleteCoupon
);

module.exports = router;