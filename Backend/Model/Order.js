const mongoose = require('mongoose');
const { randomInt } = require('crypto');

const buildOrderId = () => {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = randomInt(1000, 10000);
  return `ORD-${timestampPart}-${randomPart}`;
};

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  customerName: { type: String },
  customerEmail: { type: String },
  userId: { type: String },
  items: [
    {
      id: { type: String },
      _id: { type: String },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  deliveryInfo: {
    onCampusLocation: { type: String },
    boardingName: { type: String },
    street: { type: String },
    area: { type: String },
    phoneNumber: { type: String },
    landmark: { type: String }
  },
  addressType: {
    type: String,
    enum: ['on-campus', 'off-campus']
  },
  paymentIntentId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  pointsRedeemed: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  pickupTime: { type: String },
  assignedDeliveryAgent: { type: String, default: null },
  assignedAt: { type: Date, default: null },
  notes: { type: String },
  refundRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RefundRequest',
    default: null
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: null
  }
}, { timestamps: true });

orderSchema.statics.generateUniqueOrderId = async function generateUniqueOrderId() {
  let candidate;
  let exists = true;

  while (exists) {
    candidate = buildOrderId();
    exists = await this.exists({ orderId: candidate });
  }

  return candidate;
};

orderSchema.pre('validate', async function ensureOrderId() {
  if (!this.orderId) {
    this.orderId = await this.constructor.generateUniqueOrderId();
  }
});

module.exports = mongoose.model('Order', orderSchema);