const express = require("express");
const router = express.Router();
const paymentController = require("../Controllers/paymentController");
const { protect } = require("../middleware/auth");
const { protectUser } = require("../middleware/auth");

// Admin routes (protected)
router.get("/", protect, paymentController.getAllPayments);
router.delete("/:paymentId", protect, paymentController.deletePayment);
router.patch("/:paymentId/refund", protect, paymentController.markPaymentAsRefunded);
router.get("/refund-requests", protect, paymentController.getRefundRequests);
router.delete("/refund-requests/:refundRequestId", protect, paymentController.deleteRefundRequest);
router.patch("/refund-requests/:refundRequestId", protect, paymentController.approveRefundRequest);

// User routes (protected)
router.post("/request-refund", protectUser, paymentController.requestRefund);
router.get("/my-refund-requests", protectUser, paymentController.getUserRefundRequests);

// Create payment intent
router.post("/create-payment-intent", paymentController.createPaymentIntent);

// Confirm payment after successful Stripe charge
router.post("/confirm", paymentController.confirmPayment);

// Direct card charge
router.post("/charge-card", paymentController.chargeCard);

// Get payment details
router.get("/:paymentIntentId", paymentController.getPaymentDetails);

module.exports = router;
