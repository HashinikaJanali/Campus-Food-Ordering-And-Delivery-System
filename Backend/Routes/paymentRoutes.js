const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/paymentController");

// Create payment intent
router.post("/create-payment-intent", paymentController.createPaymentIntent);

// Confirm payment after successful Stripe charge
router.post("/confirm", paymentController.confirmPayment);

// Direct card charge
router.post("/charge-card", paymentController.chargeCard);

// Get payment details
router.get("/:paymentIntentId", paymentController.getPaymentDetails);

module.exports = router;
