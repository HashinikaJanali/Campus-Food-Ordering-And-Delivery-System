const mongoose = require("mongoose");

const pointsHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["earned", "redeemed"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const loyaltyPointsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"],
    unique: true,
  },
  userName: {
    type: String,
    required: [true, "User name is required"],
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, "Points cannot be negative"],
  },
  level: {
    type: String,
    enum: ["Bronze", "Silver", "Gold", "Platinum"],
    default: "Bronze",
  },
  history: [pointsHistorySchema],
}, {
  timestamps: true,
});

// Calculate level based on total points
loyaltyPointsSchema.methods.updateLevel = function() {
  if (this.totalPoints >= 500) {
    this.level = "Platinum";
  } else if (this.totalPoints >= 300) {
    this.level = "Gold";
  } else if (this.totalPoints >= 150) {
    this.level = "Silver";
  } else {
    this.level = "Bronze";
  }
};

// Add points
loyaltyPointsSchema.methods.addPoints = function(amount, description, orderId = null) {
  this.totalPoints += amount;
  this.history.push({
    type: "earned",
    amount,
    description,
    orderId,
  });
  this.updateLevel();
};

// Redeem points
loyaltyPointsSchema.methods.redeemPoints = function(amount, description) {
  if (this.totalPoints < amount) {
    throw new Error("Insufficient points");
  }
  this.totalPoints -= amount;
  this.history.push({
    type: "redeemed",
    amount,
    description,
  });
  this.updateLevel();
};

const LoyaltyPoints = mongoose.model("LoyaltyPoints", loyaltyPointsSchema);

module.exports = LoyaltyPoints;