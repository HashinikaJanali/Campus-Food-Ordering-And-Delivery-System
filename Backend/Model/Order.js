const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  pointsRedeemed: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  pickupTime: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);