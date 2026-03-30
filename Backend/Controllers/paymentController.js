// @ts-nocheck
const Order = require("../Model/Order");
const LoyaltyPoints = require("../Model/LoyaltyPoints");
const Notification = require("../Model/Notification");
const RefundRequest = require("../Model/RefundRequest");
const User = require("../Model/User");

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
    const { 
      paymentIntentId, 
      cart, 
      deliveryInfo, 
      addressType, 
      cartTotal, 
      deliveryCharge, 
      customerName, 
      customerEmail,
      userId,
      pointsRedeemed = 0,
      discountAmount = 0
    } = req.body;

    // Validation
    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment Intent ID is required" });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
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

    // Handle Loyalty Points Redemption
    if (pointsRedeemed > 0 && userId) {
      try {
        const loyaltyAccount = await LoyaltyPoints.findOne({ userId });
        if (loyaltyAccount) {
          loyaltyAccount.redeemPoints(pointsRedeemed, `Discount for Order ${paymentIntentId}`);
          await loyaltyAccount.save();
        }
      } catch (loyaltyError) {
        console.error("Loyalty Redemption Error:", loyaltyError);
        // We don't block the order if loyalty points fail, but we log it
      }
    }

    // Create order in database
    const order = new Order({
      customerName,
      customerEmail,
      userId,
      items: cart,
      totalAmount: cartTotal + (deliveryCharge || 0) - (discountAmount || 0),
      deliveryCharge: deliveryCharge || 0,
      pointsRedeemed,
      discountAmount,
      deliveryInfo: deliveryInfo || {},
      addressType: normalizeAddressType(addressType),
      paymentIntentId,
      paymentStatus: "Completed",
      orderStatus: "Pending",
    });

    await order.save();

    // Create a notification for the user
    if (userId) {
      try {
        await Notification.create({
          userId,
          type: "order_status_update",
          title: "🛍️ Order Placed Successfully!",
          message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed and is pending approval.`,
          icon: "🛍️",
          data: { orderId: order._id, status: "Pending" },
        });
      } catch (notifError) {
        console.error("Order placed notification error:", notifError);
      }
    }

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

/**
 * Get All Payments (Admin - for payment management)
 * GET /api/payments
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) {
      filter.paymentStatus = status;
    }
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { paymentIntentId: { $regex: search, $options: "i" } }
      ];
    }

    // Fetch orders (which contain payment info)
    const payments = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Map orders to payment format
    const mappedPayments = payments.map(order => ({
      _id: order._id,
      paymentIntentId: order.paymentIntentId,
      amount: order.totalAmount,
      status: order.paymentStatus.toLowerCase(),
      userName: order.customerName,
      userEmail: order.customerEmail,
      userId: order.userId,
      canteenName: "Campus Canteen",
      createdAt: order.createdAt,
      orderStatus: order.orderStatus,
      items: order.items
    }));

    const total = await Order.countDocuments(filter);

    console.log(`✅ Fetched ${mappedPayments.length} payments`);

    res.status(200).json({
      success: true,
      data: mappedPayments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message
    });
  }
};

/**
 * Mark Payment as Refunded (Admin)
 * PATCH /api/payments/:paymentId/refund
 */
exports.markPaymentAsRefunded = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Find the order (payment)
    const order = await Order.findById(paymentId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Update payment status to refunded
    order.paymentStatus = "Refunded";
    await order.save();

    console.log(`✅ Payment ${paymentId} marked as refunded`);

    res.status(200).json({
      success: true,
      message: "Payment marked as refunded",
      data: {
        _id: order._id,
        paymentIntentId: order.paymentIntentId,
        amount: order.totalAmount,
        status: order.paymentStatus.toLowerCase(),
        userName: order.customerName
      }
    });
  } catch (error) {
    console.error("Mark Refund Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark payment as refunded",
      error: error.message
    });
  }
};

/**
 * Request Refund (User)
 * POST /api/payments/request-refund
 * Body: { orderId, reason }
 */
exports.requestRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.body.userId || req.user?.id;

    // Validation
    if (!orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Order ID and reason are required"
      });
    }

    if (reason.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Reason must be at least 10 characters"
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This order does not belong to you"
      });
    }

    // Check if refund request already exists
    const existingRequest = await RefundRequest.findOne({
      orderId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A refund request for this order is already in progress"
      });
    }

    // Create refund request
    const refundRequest = new RefundRequest({
      orderId,
      userId,
      amount: order.totalAmount,
      reason,
      status: 'pending'
    });

    await refundRequest.save();

    // Create notification for admins
    await Notification.create({
      userId: "admin",
      type: "refund_request",
      title: "💰 Refund Request Received",
      message: `New refund request for order #${orderId.toString().slice(-6).toUpperCase()} (Rs.${order.totalAmount})`,
      icon: "💰",
      data: { refundRequestId: refundRequest._id, orderId }
    });

    console.log(`✅ Refund request created for order ${orderId}`);

    res.status(201).json({
      success: true,
      message: "Refund request submitted successfully",
      data: refundRequest
    });
  } catch (error) {
    console.error("Request Refund Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request refund",
      error: error.message
    });
  }
};

/**
 * Get Refund Requests (Admin)
 * GET /api/payments/refund-requests
 */
exports.getRefundRequests = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status !== "all") {
      filter.status = status;
    }

    // Fetch refund requests with order details
    const refundRequests = await RefundRequest.find(filter)
      .populate('orderId', 'customerName customerEmail totalAmount orderStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Enrich with user data
    const enriched = await Promise.all(
      refundRequests.map(async (req) => {
        const user = await User.findById(req.userId).select('name email');
        return {
          ...req,
          user: user || { name: req.orderId?.customerName, email: req.orderId?.customerEmail }
        };
      })
    );

    const total = await RefundRequest.countDocuments(filter);

    console.log(`✅ Fetched ${enriched.length} refund requests`);

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get Refund Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch refund requests",
      error: error.message
    });
  }
};

/**
 * Approve/Reject Refund Request (Admin)
 * PATCH /api/payments/refund-requests/:refundRequestId
 * Body: { action, adminNotes }
 */
exports.approveRefundRequest = async (req, res) => {
  try {
    const { refundRequestId } = req.params;
    const { action, adminNotes } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'approve' or 'reject'"
      });
    }

    // Find refund request
    const refundRequest = await RefundRequest.findById(refundRequestId);
    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: "Refund request not found"
      });
    }

    // Update status
    refundRequest.status = action === 'approve' ? 'approved' : 'rejected';
    refundRequest.adminNotes = adminNotes || '';
    refundRequest.approvedBy = req.user?.id || 'admin';
    await refundRequest.save();

    // Create notification for user
    const notificationTitle = action === 'approve' ? '✅ Refund Approved' : '❌ Refund Rejected';
    const notificationMessage = action === 'approve'
      ? `Your refund request has been approved. Rs.${refundRequest.amount} will be refunded.`
      : `Your refund request has been rejected. ${adminNotes ? 'Reason: ' + adminNotes : ''}`;

    await Notification.create({
      userId: refundRequest.userId,
      type: "refund_status_update",
      title: notificationTitle,
      message: notificationMessage,
      icon: action === 'approve' ? '✅' : '❌',
      data: { refundRequestId, status: refundRequest.status }
    });

    console.log(`✅ Refund request ${action}ed: ${refundRequestId}`);

    res.status(200).json({
      success: true,
      message: `Refund request ${action}ed successfully`,
      data: refundRequest
    });
  } catch (error) {
    console.error("Approve Refund Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund request",
      error: error.message
    });
  }
};

/**
 * Get User's Refund Requests
 * GET /api/payments/my-refund-requests
 */
exports.getUserRefundRequests = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id;

    const refundRequests = await RefundRequest.find({ userId })
      .populate('orderId', 'customerName customerEmail totalAmount orderStatus')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Fetched ${refundRequests.length} refund requests for user ${userId}`);

    res.status(200).json({
      success: true,
      data: refundRequests
    });
  } catch (error) {
    console.error("Get User Refund Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your refund requests",
      error: error.message
    });
  }
};
