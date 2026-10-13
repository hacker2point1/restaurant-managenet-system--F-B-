const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    // ============================================================
    // CUSTOMER
    // ============================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // ============================================================
    // BRANCH
    // ============================================================

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    // ============================================================
    // TABLE
    // ============================================================

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },

    // ============================================================
    // RESERVATION DATE
    // ============================================================

    reservationDate: {
      type: Date,
      required: true,
      index: true,
    },

    // ============================================================
    // START TIME
    // ============================================================

    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    // ============================================================
    // END TIME
    // ============================================================

    endTime: {
      type: Date,
      required: true,
      index: true,
    },

    // ============================================================
    // NUMBER OF GUESTS
    // ============================================================

    guestCount: {
      type: Number,
      required: true,
      min: 1,
    },

    // ============================================================
    // RESERVATION STATUS
    // ============================================================

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
        "no-show",
      ],
      default: "pending",
      index: true,
    },

    // ============================================================
    // SPECIAL REQUEST
    // ============================================================

    specialRequest: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // ============================================================
    // CANCELLED AT
    // ============================================================

    cancelledAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // CONFIRMED AT
    // ============================================================

    confirmedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // COMPLETED AT
    // ============================================================

    completedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // NO-SHOW AT
    // ============================================================

    noShowAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // CREATED BY
    // ============================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ================================================================
// INDEXES
// ================================================================

// Find reservations for a branch on a particular date
reservationSchema.index({
  branch: 1,
  reservationDate: 1,
});

// Find reservations for a particular table on a date
reservationSchema.index({
  branch: 1,
  reservationDate: 1,
  table: 1,
});

// Useful for time-range queries
reservationSchema.index({
  branch: 1,
  startTime: 1,
  endTime: 1,
});

// Customer reservation history
reservationSchema.index({
  customer: 1,
  reservationDate: -1,
});

// Reservation status filtering
reservationSchema.index({
  branch: 1,
  status: 1,
  reservationDate: 1,
});

// ================================================================
// EXPORT
// ================================================================

module.exports = mongoose.model(
  "Reservation",
  reservationSchema
);