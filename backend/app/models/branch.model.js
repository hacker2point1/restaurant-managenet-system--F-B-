const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    branchCode: {
      type: String,
      required: true,
      trim: true,
    },

    contact: {
      phone: String,
      email: String,
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

    openingHours: {
      monday: {
        open: String,
        close: String,
        isClosed: Boolean,
      },
      tuesday: {
        open: String,
        close: String,
        isClosed: Boolean,
      },
      wednesday: {
        open: String,
        close: String,
        isClosed: Boolean,
      },
      thursday: {
        open: String,
        close: String,
        isClosed: Boolean,
      },
      friday: {
        open: String,
        close: String,
        isClosed: Boolean,
      },
      saturday: {
        open: String,
        close: String,
        isClosed: Boolean,
      },
      sunday: {
        open: String,
        close: String,
        isClosed: Boolean,
      },
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
    images: [
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
],
  },
  {
    timestamps: true,
  },
);

branchSchema.index({
  restaurant: 1,
  branchCode: 1,
});

module.exports = mongoose.model("Branch", branchSchema);
