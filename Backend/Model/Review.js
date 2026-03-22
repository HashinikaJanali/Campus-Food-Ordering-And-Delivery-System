const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
    },

    orderId: {
      type: String,
      required: [true, "Order ID is required"],
    },

    foodItem: {
      type: String,
      required: [true, "Food item is required"],
    },

    vendor: {
      type: String,
      required: [true, "Vendor is required"],
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    reviewText: {
      type: String,
      maxlength: [1000, "Review text cannot exceed 1000 characters"],
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },

    verified: {
      type: Boolean,
      default: true,
    },

    helpful: {
      type: Number,
      default: 0,
    },

    // ----------------------------------
    // ⭐ AI Analysis Fields (NEW)
    // ----------------------------------
    aiAnalysis: {
      confidence: {
        type: Number,
        default: 0,
      },

      emotions: [
        {
          emotion: String,
          confidence: Number,
        },
      ],

      topics: [
        {
          topic: String,
          confidence: Number,
        },
      ],

      method: {
        type: String,
        enum: ["ai-powered", "rule-based", "fallback"],
        default: "rule-based",
      },

      analyzedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);