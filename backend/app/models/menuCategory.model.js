const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    displayOrder: {
      type: Number,
      default: 0,
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

menuCategorySchema.index({
  branch: 1,
  name: 1,
});

menuCategorySchema.index({
  branch: 1,
  isActive: 1,
  isDeleted: 1,
});

menuCategorySchema.index({
  branch: 1,
  displayOrder: 1,
});

module.exports = mongoose.model(
  "MenuCategory",
  menuCategorySchema
);