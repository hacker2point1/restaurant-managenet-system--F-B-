const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
      index: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "purchase",
        "stock-in",
        "stock-out",
        "wastage",
        "return",
        "adjustment",
      ],
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    previousQuantity: {
      type: Number,
      required: true,
    },

    newQuantity: {
      type: Number,
      required: true,
    },

    unitCost: {
      type: Number,
      default: 0,
    },

    referenceType: {
      type: String,
      enum: [
        "order",
        "purchase",
        "manual",
        "wastage",
        "return",
        "other",
      ],
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    reason: {
      type: String,
      trim: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

inventoryTransactionSchema.index({
  inventoryItem: 1,
  transactionDate: -1,
});

inventoryTransactionSchema.index({
  branch: 1,
  transactionDate: -1,
});

inventoryTransactionSchema.index({
  branch: 1,
  type: 1,
  transactionDate: -1,
});

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);