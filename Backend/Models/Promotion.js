const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a promotion title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  badge: {
    type: String,
    required: [true, 'Please add a badge (e.g., 50% OFF)'],
  },
  code: {
    type: String,
    required: [true, 'Please add a promo code'],
    uppercase: true,
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  timer: {
    type: String,
    required: [true, 'Please add a timer text (e.g., Ends in 2 days)'],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Promotion', promotionSchema);
