const LoyaltyPoints = require("../Model/LoyaltyPoints");

// Get loyalty account
const getLoyaltyAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let loyaltyAccount = await LoyaltyPoints.findOne({ userId });

    if (!loyaltyAccount) {
      return res.status(404).json({
        success: false,
        message: "Loyalty account not found",
      });
    }

    res.status(200).json({
      success: true,
      data: loyaltyAccount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create loyalty account
const createLoyaltyAccount = async (req, res) => {
  try {
    const { userId, userName } = req.body;

    // Check if account already exists
    let loyaltyAccount = await LoyaltyPoints.findOne({ userId });

    if (loyaltyAccount) {
      return res.status(400).json({
        success: false,
        message: "Loyalty account already exists",
      });
    }

    loyaltyAccount = new LoyaltyPoints({
      userId,
      userName,
      totalPoints: 50,
    });

    loyaltyAccount.history.push({
      type: "earned",
      amount: 50,
      description: "Welcome Bonus!",
    });

    await loyaltyAccount.save();

    res.status(201).json({
      success: true,
      message: "Loyalty account created successfully with 50 welcome points!",
      data: loyaltyAccount,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Add points
const addPoints = async (req, res) => {
  try {
    const { userId, amount, description, orderId } = req.body;

    let loyaltyAccount = await LoyaltyPoints.findOne({ userId });

    if (!loyaltyAccount) {
      return res.status(404).json({
        success: false,
        message: "Loyalty account not found",
      });
    }

    loyaltyAccount.addPoints(amount, description, orderId);
    await loyaltyAccount.save();

    res.status(200).json({
      success: true,
      message: `${amount} points added successfully`,
      data: loyaltyAccount,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Redeem points
const redeemPoints = async (req, res) => {
  try {
    const { userId, amount, rewardName } = req.body;

    let loyaltyAccount = await LoyaltyPoints.findOne({ userId });

    if (!loyaltyAccount) {
      return res.status(404).json({
        success: false,
        message: "Loyalty account not found",
      });
    }

    if (loyaltyAccount.totalPoints < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient points",
        required: amount,
        available: loyaltyAccount.totalPoints,
      });
    }

    loyaltyAccount.redeemPoints(amount, `Redeemed: ${rewardName}`);
    await loyaltyAccount.save();

    res.status(200).json({
      success: true,
      message: `${rewardName} redeemed successfully!`,
      data: loyaltyAccount,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get points history
const getPointsHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const loyaltyAccount = await LoyaltyPoints.findOne({ userId });

    if (!loyaltyAccount) {
      return res.status(404).json({
        success: false,
        message: "Loyalty account not found",
      });
    }

    const history = loyaltyAccount.history.sort((a, b) => b.date - a.date);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const leaderboard = await LoyaltyPoints.find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select("userId userName totalPoints level");

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export all functions
module.exports = {
  getLoyaltyAccount,
  createLoyaltyAccount,
  addPoints,
  redeemPoints,
  getPointsHistory,
  getLeaderboard,
};