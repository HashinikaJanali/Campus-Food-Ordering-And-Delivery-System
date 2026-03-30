const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/paymentController");
const { protect } = require("../middleware/auth");

// Admin routes
router.get("/", protect, paymentController.getAllPayments);
router.patch("/:paymentId/refund", protect, paymentController.markPaymentAsRefunded);

// Create payment intent
router.post("/create-payment-intent", paymentController.createPaymentIntent);

// Confirm payment after successful Stripe charge
router.post("/confirm", paymentController.confirmPayment);

// Direct card charge
router.post("/charge-card", paymentController.chargeCard);

// Get payment details
router.get("/:paymentIntentId", paymentController.getPaymentDetails);

module.exports = router;
