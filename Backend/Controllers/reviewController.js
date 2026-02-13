const Review = require("../Model/Review");
const LoyaltyPoints = require("../Model/LoyaltyPoints");

// Create a new review
const createReview = async (req, res) => {
  try {
    console.log("📝 Creating review...");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { userId, userName, orderId, foodItem, vendor, rating, reviewText } = req.body;

    if (!userId || !userName || !orderId || !foodItem || !vendor || !rating) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      console.log("✅ Image uploaded:", imageUrl);
    }

    const existingReview = await Review.findOne({ userId, orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this order",
      });
    }

    // Determine sentiment based on rating
    let sentiment = "neutral";
    const ratingNum = parseInt(rating);
    if (ratingNum >= 4) {
      sentiment = "positive";
    } else if (ratingNum <= 2) {
      sentiment = "negative";
    }

    const review = new Review({
      userId,
      userName,
      orderId,
      foodItem,
      vendor,
      rating: ratingNum,
      reviewText: reviewText || "",
      imageUrl,
      sentiment, // Set sentiment here instead of in pre-save hook
    });

    await review.save();
    console.log("✅ Review saved:", review._id);

    let loyaltyAccount = await LoyaltyPoints.findOne({ userId });
    
    if (!loyaltyAccount) {
      console.log("Creating new loyalty account for:", userId);
      loyaltyAccount = new LoyaltyPoints({
        userId,
        userName,
        totalPoints: 0,
      });
    }

    loyaltyAccount.addPoints(5, `Review Bonus - ${foodItem}`, orderId);
    await loyaltyAccount.save();
    console.log("✅ Points awarded:", loyaltyAccount.totalPoints);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully! You earned 5 points.",
      data: review,
      pointsEarned: 5,
    });
  } catch (error) {
    console.error("❌ Create review error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all reviews
const getReviews = async (req, res) => {
  try {
    const { rating, sentiment, verified, search, sort = "recent" } = req.query;
    
    let query = {};

    if (rating) query.rating = parseInt(rating);
    if (sentiment) query.sentiment = sentiment;
    if (verified) query.verified = verified === "true";
    if (search) {
      query.$or = [
        { foodItem: { $regex: search, $options: "i" } },
        { reviewText: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case "recent":
        sortOption = { createdAt: -1 };
        break;
      case "helpful":
        sortOption = { helpful: -1 };
        break;
      case "highest":
        sortOption = { rating: -1 };
        break;
      case "lowest":
        sortOption = { rating: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const reviews = await Review.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reviews by user
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error getting user reviews:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined) review.rating = parseInt(rating);
    if (reviewText !== undefined) review.reviewText = reviewText;
    
    if (req.file) {
      review.imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const loyaltyAccount = await LoyaltyPoints.findOne({ userId: review.userId });
    if (loyaltyAccount && loyaltyAccount.totalPoints >= 5) {
      loyaltyAccount.totalPoints -= 5;
      loyaltyAccount.history.push({
        type: "redeemed",
        amount: 5,
        description: `Review deleted - ${review.foodItem}`,
      });
      await loyaltyAccount.save();
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get rating summary
const getRatingSummary = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const sentimentDistribution = await Review.aggregate([
      {
        $group: {
          _id: "$sentiment",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating: averageRating.length > 0 ? averageRating[0].avgRating.toFixed(1) : 0,
        ratingDistribution,
        sentimentDistribution,
      },
    });
  } catch (error) {
    console.error("Error getting summary:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.helpful += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: "Marked as helpful",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  getUserReviews,
  updateReview,
  deleteReview,
  getRatingSummary,
  markHelpful,
};