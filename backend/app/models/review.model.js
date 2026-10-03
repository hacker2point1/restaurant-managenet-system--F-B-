const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      index: true,
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    moderatedAt: {
      type: Date,
    },
    
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({
  restaurant: 1,
  rating: -1,
});

reviewSchema.index({
  menuItem: 1,
  rating: -1,
});

reviewSchema.index({
  customer: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Review", reviewSchema);