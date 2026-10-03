const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const reservationController = require("../../controller/reservation/reservation.controller");

// ============================================================
// RESERVATION
// ============================================================

// Create reservation
router.post(
  "/branches/:branchId/reservations",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reservationController.createReservation
);

// Get all reservations for branch
router.get(
  "/branches/:branchId/reservations",
  Auth,
  authorize("admin", "manager", "staff"),
  reservationController.getReservations
);

// Check reservation availability
router.get(
  "/branches/:branchId/reservations/check-availability",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reservationController.checkReservationAvailability
);

// Get reservation history for customer
router.get(
  "/customers/:customerId/reservations/history",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reservationController.getReservationHistory
);

// Get reservation by ID
router.get(
  "/reservations/:id",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reservationController.getReservationById
);

// Update reservation
router.patch(
  "/reservations/:id",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reservationController.updateReservation
);

// Cancel reservation
router.patch(
  "/reservations/:id/cancel",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  reservationController.cancelReservation
);

// Confirm reservation
router.patch(
  "/reservations/:id/confirm",
  Auth,
  authorize("admin", "manager", "staff"),
  reservationController.confirmReservation
);

// Complete reservation
router.patch(
  "/reservations/:id/complete",
  Auth,
  authorize("admin", "manager", "staff"),
  reservationController.completeReservation
);

// Mark no-show
router.patch(
  "/reservations/:id/no-show",
  Auth,
  authorize("admin", "manager", "staff"),
  reservationController.markNoShow
);

// Assign table
router.patch(
  "/reservations/:id/assign-table",
  Auth,
  authorize("admin", "manager", "staff"),
  reservationController.assignTable
);

module.exports = router;