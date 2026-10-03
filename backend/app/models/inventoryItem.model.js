const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
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

    sku: {
      type: String,
      trim: true,
    },

    unit: {
      type: String,
      enum: [
        "kg",
        "gram",
        "liter",
        "ml",
        "piece",
        "packet",
        "box",
      ],
      required: true,
    },

    currentQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumStock: {
      type: Number,
      min: 0,
    },

    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    supplier: {
      name: String,
      phone: String,
      email: String,
    },

    expiryDate: {
      type: Date,
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

inventoryItemSchema.index({
  branch: 1,
  name: 1,
});

inventoryItemSchema.index({
  branch: 1,
  currentQuantity: 1,
});

inventoryItemSchema.index({
  expiryDate: 1,
});

module.exports = mongoose.model(
  "InventoryItem",
  inventoryItemSchema
);