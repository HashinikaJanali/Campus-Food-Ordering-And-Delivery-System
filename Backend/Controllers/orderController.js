const Order = require('../Model/Order');
const Notification = require("../Model/Notification");

// Get all orders for logged-in user
exports.getAllOrders = async (req, res) => {
  try {
    // Only show orders for the authenticated user
    const userId = req.user.id;
    
    console.log(`📦 Fetching orders for user: ${userId}`);
    
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    
    console.log(`✅ Found ${orders.length} orders for user ${userId}`);
    
    res.json({ data: orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send notification if order has a userId
    if (order.userId) {
      try {
        let title = "📦 Order Update";
        let message = `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status}.`;
        let icon = "📦";

        if (status === 'preparing') {
          title = "👨‍🍳 Cooking Started!";
          message = "Your order is being prepared in the kitchen.";
          icon = "👨‍🍳";
        } else if (status === 'ready') {
          title = "🥡 Order Ready!";
          message = "Your delicious meal is ready for pickup!";
          icon = "🥡";
        } else if (status === 'delivered') {
          title = "✅ Order Delivered!";
          message = "Enjoy your meal! Please leave a review.";
          icon = "😋";
        } else if (status === 'cancelled') {
          title = "❌ Order Cancelled";
          message = "Your order has been cancelled. Please contact support.";
          icon = "❌";
        }

        await Notification.create({
          userId: order.userId,
          type: "order_status_update",
          title,
          message,
          icon,
          data: { orderId: order._id, status },
        });
      } catch (notifError) {
        console.error("Status update notification error:", notifError);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};