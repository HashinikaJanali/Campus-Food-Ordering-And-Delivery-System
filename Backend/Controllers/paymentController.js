// @ts-nocheck
const Order = require("../Model/Order");

const normalizeAddressType = (value) => {
  if (value === "on-campus" || value === "off-campus") {
    return value;
  }
  return "on-campus";
};

// Initialize Stripe lazily when needed
const getStripe = () => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  return stripe;
};

/**
 * Create Payment Intent
 * POST /api/payments/create-payment-intent
 * Body: { amount, currency, email, cartItems, deliveryInfo, addressType }
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "inr", email, cartItems, deliveryInfo, addressType } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        message: "Stripe Secret Key not configured on server"
      });
    }

    const stripe = getStripe();

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method_types: ["card"],
      receipt_email: email,
      metadata: {
        addressType: addressType || 'unknown',
        itemCount: cartItems?.length || 0,
        createdAt: new Date().toISOString(),
      },
    });

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).json({
      message: "Failed to create payment intent",
      error: error.message
    });
  }
};

/**
 * Confirm Payment (After Stripe payment is processed)
 * POST /api/payments/confirm
 * Body: { paymentIntentId, cart, deliveryInfo, addressType, cartTotal, deliveryCharge }
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, cart, deliveryInfo, addressType, cartTotal, deliveryCharge } = req.body;

    // Validation
    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment Intent ID is required" });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (!cartTotal || cartTotal <= 0) {
      return res.status(400).json({ message: "Valid cart total is required" });
    }

    const stripe = getStripe();

    // Retrieve payment intent from Stripe
    let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // In non-production, auto-confirm with Stripe's test payment method if the
    // frontend did not run confirmCardPayment yet.
    if (
      paymentIntent.status !== "succeeded" &&
      process.env.NODE_ENV !== "production" &&
      ["requires_payment_method", "requires_confirmation"].includes(paymentIntent.status)
    ) {
      paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: "pm_card_visa",
      });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "Payment not completed",
        status: paymentIntent.status
      });
    }

    // Create order in database
    const order = new Order({
      items: cart,
      totalAmount: cartTotal + (deliveryCharge || 0),
      deliveryCharge: deliveryCharge || 0,
      deliveryInfo: deliveryInfo || {},
      addressType: normalizeAddressType(addressType),
      paymentIntentId,
      paymentStatus: "Completed",
      orderStatus: "Pending",
    });

    await order.save();

    res.status(201).json({
      success: true,
      orderId: order._id,
      message: "Order created successfully after payment",
      order,
    });
  } catch (error) {
    console.error("Payment Confirmation Error:", error);
    res.status(500).json({
      message: "Failed to confirm payment",
      error: error.message
    });
  }
};

/**
 * Simple Card Charge (Direct charge without Payment Intent)
 * POST /api/payments/charge-card
 * Body: { cardToken, amount, currency, email }
 */
exports.chargeCard = async (req, res) => {
  try {
    const { cardToken, amount, currency = "inr", email } = req.body;

    if (!cardToken) {
      return res.status(400).json({ message: "Card token is required" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const stripe = getStripe();

    // Create a charge
    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      source: cardToken,
      receipt_email: email,
    });

    res.status(200).json({
      success: true,
      chargeId: charge.id,
      message: "Payment successful",
    });
  } catch (error) {
    console.error("Charge Error:", error);
    res.status(500).json({ 
      message: "Payment failed",
      error: error.message 
    });
  }
};

/**
 * Get Payment Details
 * GET /api/payments/:paymentIntentId
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.status(200).json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve payment details",
      error: error.message 
    });
  }
};
