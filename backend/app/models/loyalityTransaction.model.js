const mongoose = require("mongoose");

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    points: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "earned",
        "redeemed",
        "adjusted",
        "expired",
      ],
      required: true,
      index: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    referenceType: {
      type: String,
      enum: ["order", "manual", "coupon", "other"],
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    description: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

loyaltyTransactionSchema.index({
  customer: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "LoyaltyTransaction",
  loyaltyTransactionSchema
);