const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  alertType: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'restocked', 'threshold_changed'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockAlert', stockAlertSchema);
