const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

   
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
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
    },

   
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

   
    ingredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryItem",
      },
    ],

   
    foodType: {
      type: String,
      enum: ["vegetarian", "non-vegetarian", "vegan"],
      required: true,
      index: true,
    },

   
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

   
    images: {
      type: [
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

      default: [],

      validate: {
        validator: function (images) {
          return images.length <= 5;
        },

        message: "A menu item can have maximum 5 images",
      },
    },

   
    preparationTime: {
      type: Number,
      min: 0,
    },

   
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

  
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

   
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
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

//index

// Branch + Category
menuItemSchema.index({
  branch: 1,
  category: 1,
});

// Branch + Price
menuItemSchema.index({
  branch: 1,
  price: 1,
});

// Branch + Availability
menuItemSchema.index({
  branch: 1,
  isAvailable: 1,
});

// Branch + Deleted
menuItemSchema.index({
  branch: 1,
  isDeleted: 1,
});

// Branch + Rating
menuItemSchema.index({
  branch: 1,
  averageRating: -1,
});

// Branch + Reviews
menuItemSchema.index({
  branch: 1,
  totalReviews: -1,
});

// Text Search
menuItemSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

module.exports = mongoose.model("MenuItem", menuItemSchema);