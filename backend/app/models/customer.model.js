const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // ============================================================
    // USER
    // ============================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },

    

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      index: true,
    },

   

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

   
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalVisits: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastVisitAt: {
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

// INDEXES

customerSchema.index({
  name: "text",
  email: "text",
  phone: "text",
});

customerSchema.index({
  isDeleted: 1,
  isActive: 1,
});

customerSchema.index({
  createdAt: -1,
});

customerSchema.index({
  totalSpent: -1,
});

customerSchema.index({
  totalVisits: -1,
});

// ================================================================
// EXPORT
// ================================================================

module.exports = mongoose.model("Customer", customerSchema);