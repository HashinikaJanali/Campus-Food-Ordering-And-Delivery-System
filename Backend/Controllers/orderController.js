const Order = require('../Model/Order');
const Notification = require("../Model/Notification");
const mongoose = require('mongoose');

const emitOrderHistoryUpdate = (req, payload = {}) => {
  const io = req.app.get('io');
  if (io) {
    io.emit('orders:history-updated', {
      at: new Date().toISOString(),
      ...payload,
    });
  }
};

const emitDeliveryUpdate = (req, payload = {}) => {
  const io = req.app.get('io');
  if (io) {
    io.emit('orders:delivery-updated', {
      at: new Date().toISOString(),
      ...payload,
    });
  }
};

const emitStudentOrdersUpdate = (req, userId, payload = {}) => {
  const io = req.app.get('io');
  if (io && userId) {
    io.emit('orders:student-updated', {
      at: new Date().toISOString(),
      userId: String(userId),
      ...payload,
    });
  }
};

const findOrderByIdentifier = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byMongoId = await Order.findById(identifier);
    if (byMongoId) return byMongoId;
  }

  return Order.findOne({ orderId: identifier.toUpperCase() });
};

// Get orders: admin sees all users, user sees only own
exports.getAllOrders = async (req, res) => {
  try {
    const { status = "", search = "", userId = "" } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];
    }

    if (req.admin) {
      if (userId) filter.userId = userId;
      const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
      console.log(`📦 Admin ${req.admin._id} fetched ${orders.length} orders`);
      return res.json({ data: orders });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    filter.userId = req.user.id;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    console.log(`📦 User ${req.user.id} fetched ${orders.length} own orders`);
    return res.json({ data: orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get order history (completed + cancelled) for admin dashboard
exports.getOrderHistory = async (req, res) => {
  try {
    const { search = '', date = 'all' } = req.query;

    const filter = {
      $or: [
        { status: { $in: ['delivered', 'cancelled'] } },
        { orderStatus: { $in: ['Delivered', 'Cancelled'] } },
      ],
    };

    if (search) {
      filter.$and = [
        {
          $or: [
            { orderId: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { customerEmail: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    if (date && date !== 'all') {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ data: orders });
  } catch (err) {
    console.error('Error fetching order history:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get placed orders for currently logged-in student/user
exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { status = '', search = '' } = req.query;
    const filter = { userId: req.user.id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ data: orders });
  } catch (err) {
    console.error('Error fetching my orders:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Get active (in-progress) orders for currently logged-in student/user
exports.getMyActiveOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const activeStatuses = ['pending', 'preparing', 'ready', 'delivering'];
    const orders = await Order.find({
      userId: req.user.id,
      status: { $in: activeStatuses },
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ data: orders });
  } catch (err) {
    console.error('Error fetching active orders:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Track a single order by orderId / db id for logged-in student/user
exports.trackMyOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const identifier = req.params.orderId;
    const order = await findOrderByIdentifier(identifier);

    if (!order || String(order.userId) !== String(req.user.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ data: order });
  } catch (err) {
    console.error('Error tracking order:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Get assigned delivery orders for delivery staff dashboard
exports.getAssignedDeliveryOrders = async (req, res) => {
  try {
    const { agent = '', search = '' } = req.query;

    const filter = {
      addressType: 'off-campus',
      status: { $in: ['ready', 'delivering'] },
      assignedDeliveryAgent: { $exists: true, $ne: null },
    };

    if (agent) {
      filter.assignedDeliveryAgent = agent;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { assignedDeliveryAgent: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter).sort({ updatedAt: -1 }).lean();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const deliveredFilter = {
      addressType: 'off-campus',
      status: 'delivered',
      updatedAt: { $gte: todayStart, $lte: todayEnd },
    };

    if (agent) {
      deliveredFilter.assignedDeliveryAgent = agent;
    }

    const deliveredToday = await Order.countDocuments(deliveredFilter);

    return res.json({
      data: orders,
      meta: {
        assigned: orders.length,
        delivering: orders.filter((o) => o.status === 'delivering').length,
        deliveredToday,
      },
    });
  } catch (err) {
    console.error('Error fetching assigned delivery orders:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { orderId, ...orderPayload } = req.body;
    const order = new Order(orderPayload);
    const saved = await order.save();
    emitOrderHistoryUpdate(req, { type: 'created', orderId: saved.orderId, status: saved.status });
    emitStudentOrdersUpdate(req, saved.userId, { type: 'created', orderId: saved.orderId, status: saved.status });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await findOrderByIdentifier(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // For delivery orders, completion must be done by delivery staff flow, not admin panels.
    if (order.addressType === 'off-campus' && String(status).toLowerCase() === 'delivered' && req.admin) {
      return res.status(403).json({ message: 'Only delivery staff can mark delivery orders as delivered' });
    }

    order.status = status;
    await order.save();

    emitOrderHistoryUpdate(req, { type: 'status', orderId: order.orderId, status: order.status });
    emitDeliveryUpdate(req, {
      type: 'status',
      orderId: order.orderId,
      status: order.status,
      assignedDeliveryAgent: order.assignedDeliveryAgent || null,
    });
    emitStudentOrdersUpdate(req, order.userId, { type: 'status', orderId: order.orderId, status: order.status });

    // Send notification if order has a userId
    if (order.userId) {
      try {
        let title = "📦 Order Update";
        let message = `Your order #${order.orderId || order._id} is now ${status}.`;
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
          data: { orderId: order.orderId, orderDbId: order._id, status },
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

// Update delivery / pickup fulfillment details
exports.updateFulfillmentDetails = async (req, res) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const {
      pickupTime,
      onCampusLocation,
      assignedDeliveryAgent,
      deliveryInfo,
    } = req.body;

    if (typeof pickupTime === 'string') {
      order.pickupTime = pickupTime;
    }

    if (!order.deliveryInfo) {
      order.deliveryInfo = {};
    }

    if (typeof onCampusLocation === 'string') {
      order.deliveryInfo.onCampusLocation = onCampusLocation;
    }

    // Allow partial delivery address updates when needed
    if (deliveryInfo && typeof deliveryInfo === 'object') {
      order.deliveryInfo = {
        ...order.deliveryInfo,
        ...deliveryInfo,
      };
    }

    if (typeof assignedDeliveryAgent === 'string') {
      if (!req.admin) {
        return res.status(403).json({ message: 'Only admin can assign a delivery rider' });
      }

      if (order.addressType !== 'off-campus') {
        return res.status(400).json({ message: 'Rider assignment is allowed only for delivery orders' });
      }

      const trimmed = assignedDeliveryAgent.trim();
      if (trimmed && order.status !== 'ready') {
        return res.status(400).json({ message: 'Rider can be assigned only after order status is Ready' });
      }

      order.assignedDeliveryAgent = trimmed || null;
      order.assignedAt = trimmed ? new Date() : null;
    }

    await order.save();
    emitDeliveryUpdate(req, {
      type: 'fulfillment',
      orderId: order.orderId,
      status: order.status,
      assignedDeliveryAgent: order.assignedDeliveryAgent || null,
    });
    emitStudentOrdersUpdate(req, order.userId, { type: 'fulfillment', orderId: order.orderId, status: order.status });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const deletedOrderId = order.orderId;
    const deletedUserId = order.userId;
    await order.deleteOne();
    emitOrderHistoryUpdate(req, { type: 'deleted', orderId: deletedOrderId });
    emitStudentOrdersUpdate(req, deletedUserId, { type: 'deleted', orderId: deletedOrderId });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};