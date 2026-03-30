const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: 500
  },
  refundedAt: {
    type: Date
  },
  approvedBy: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
