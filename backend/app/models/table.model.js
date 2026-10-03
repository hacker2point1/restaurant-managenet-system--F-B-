const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    location: {
      type: String,
      enum: [
        "indoor",
        "outdoor",
        "rooftop",
        "private",
        "bar",
      ],
      default: "indoor",
    },

    status: {
      type: String,
      enum: [
        "available",
        "occupied",
        "reserved",
        "maintenance",
      ],
      default: "available",
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

// Table number should be unique within a branch
tableSchema.index(
  {
    branch: 1,
    tableNumber: 1,
  },
  {
    unique: true,
  }
);

tableSchema.index({
  branch: 1,
  status: 1,
});

module.exports = mongoose.model("Table", tableSchema);