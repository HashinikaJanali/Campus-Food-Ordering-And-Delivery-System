const express = require("express");
const router = express.Router();
const loyaltyController = require("../Controllers/loyaltyController");

router.post("/create", loyaltyController.createLoyaltyAccount);
router.get("/:userId", loyaltyController.getLoyaltyAccount);
router.post("/add-points", loyaltyController.addPoints);
router.post("/redeem", loyaltyController.redeemPoints);
router.get("/:userId/history", loyaltyController.getPointsHistory);
router.get("/leaderboard/top", loyaltyController.getLeaderboard);

module.exports = router;