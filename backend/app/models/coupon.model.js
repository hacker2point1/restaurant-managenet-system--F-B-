const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
    },

    maximumDiscountAmount: {
      type: Number,
    },

    usageLimit: {
      type: Number,
    },

    usageCount: {
      type: Number,
      default: 0,
    },

    perCustomerLimit: {
      type: Number,
    },

    applicableCustomers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],

    applicableBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
  type: Boolean,
  default: false,
  index: true,
},

deletedAt: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

couponSchema.index({
  restaurant: 1,
  code: 1,
});

module.exports = mongoose.model("Coupon", couponSchema);