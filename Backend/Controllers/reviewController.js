const Review = require("../Model/Review");
const LoyaltyPoints = require("../Model/LoyaltyPoints");
const Notification = require("../Model/Notification");
const aiService = require("../services/aiService");

// Create a new review with AI analysis
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

    // 🤖 AI ANALYSIS - NEW!
    console.log("🤖 Running AI analysis on review text...");
    let aiAnalysis = null;
    let sentiment = "neutral";

    if (reviewText && reviewText.trim().length >= 10) {
      try {
        // Run AI analysis
        aiAnalysis = await aiService.analyzeReview(reviewText);
        sentiment = aiAnalysis.sentiment;
        console.log("✅ AI Analysis complete:", {
          sentiment: aiAnalysis.sentiment,
          confidence: aiAnalysis.confidence,
          emotions: aiAnalysis.emotions,
          topics: aiAnalysis.topics,
          method: aiAnalysis.method
        });
      } catch (error) {
        console.error("⚠️ AI analysis failed, using fallback:", error.message);
        // Fallback to rating-based sentiment
        const ratingNum = parseInt(rating);
        if (ratingNum >= 4) sentiment = "positive";
        else if (ratingNum <= 2) sentiment = "negative";
      }
    } else {
      // No text or too short, use rating-based sentiment
      const ratingNum = parseInt(rating);
      if (ratingNum >= 4) sentiment = "positive";
      else if (ratingNum <= 2) sentiment = "negative";
    }

    const review = new Review({
      userId,
      userName,
      orderId,
      foodItem,
      vendor,
      rating: parseInt(rating),
      reviewText: reviewText || "",
      imageUrl,
      sentiment,
      aiAnalysis: aiAnalysis ? {
        confidence: parseFloat(aiAnalysis.confidence),
        emotions: aiAnalysis.emotions || [],
        topics: aiAnalysis.topics || [],
        method: aiAnalysis.method || 'rule-based',
        analyzedAt: new Date(),
      } : undefined,
    });

    await review.save();
    console.log("✅ Review saved:", review._id);

    // Award loyalty points
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

    // Create notification
    await Notification.create({
      userId,
      type: 'points_earned',
      title: '⭐ Review Bonus!',
      message: 'You earned 5 points for writing a review!',
      icon: '⭐',
      data: { points: 5, reviewId: review._id },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully! AI analysis complete.",
      data: review,
      pointsEarned: 5,
      aiPowered: aiAnalysis?.method === 'ai-powered', // Tell frontend if AI was used
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

// Update a review with AI re-analysis
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

    // 🤖 Re-run AI analysis if review text changed
    if (reviewText && reviewText.trim().length >= 10) {
      console.log("🤖 Re-analyzing updated review...");
      try {
        const aiAnalysis = await aiService.analyzeReview(reviewText);
        review.sentiment = aiAnalysis.sentiment;
        review.aiAnalysis = {
          confidence: parseFloat(aiAnalysis.confidence),
          emotions: aiAnalysis.emotions || [],
          topics: aiAnalysis.topics || [],
          method: aiAnalysis.method || 'rule-based',
          analyzedAt: new Date(),
        };
        console.log("✅ AI re-analysis complete");
      } catch (error) {
        console.error("⚠️ AI re-analysis failed:", error.message);
      }
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

// 🤖 NEW: Get AI insights for a specific vendor
const getVendorInsights = async (req, res) => {
  try {
    const { vendor } = req.params;
    
    console.log(`🤖 Generating AI insights for vendor: ${vendor}`);
    
    const reviews = await Review.find({ vendor });
    
    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: 'No reviews yet for this vendor',
          strengths: [],
          improvements: [],
          overallSentiment: 'neutral',
          totalReviews: 0,
        }
      });
    }

    const insights = await aiService.generateVendorInsights(reviews);
    
    res.status(200).json({
      success: true,
      data: {
        ...insights,
        totalReviews: reviews.length,
        vendor,
      }
    });
  } catch (error) {
    console.error("Error generating vendor insights:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🤖 NEW: Get overall AI analytics
const getAIAnalytics = async (req, res) => {
  try {
    console.log("🤖 Generating overall AI analytics...");
    
    const reviews = await Review.find({ 'aiAnalysis.method': 'ai-powered' });
    
    const totalAIReviews = reviews.length;
    const avgConfidence = reviews.reduce((sum, r) => sum + (r.aiAnalysis?.confidence || 0), 0) / totalAIReviews;
    
    // Get most common emotions
    const emotionCounts = {};
    reviews.forEach(r => {
      r.aiAnalysis?.emotions?.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      });
    });
    
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));
    
    // Get most common topics
    const topicCounts = {};
    reviews.forEach(r => {
      r.aiAnalysis?.topics?.forEach(t => {
        topicCounts[t.topic] = (topicCounts[t.topic] || 0) + 1;
      });
    });
    
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
    
    res.status(200).json({
      success: true,
      data: {
        totalAIReviews,
        averageConfidence: avgConfidence.toFixed(1),
        topEmotions,
        topTopics,
      }
    });
  } catch (error) {
    console.error("Error generating AI analytics:", error);
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
  getVendorInsights,    // NEW!
  getAIAnalytics,       // NEW!
};