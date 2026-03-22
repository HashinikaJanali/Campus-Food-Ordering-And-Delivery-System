const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  canteen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canteen',
    required: [true, 'Canteen is required']
  },
  image: {
    type: String,
    default: null
  },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Threshold cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isMenuVisible: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  tags: [{
    type: String,
    trim: true
  }],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  allergens: [{
    type: String
  }],
  totalSold: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for stock status
foodItemSchema.virtual('stockStatus').get(function () {
  if (this.stockQuantity === 0) return 'out_of_stock';
  if (this.stockQuantity <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Pre-save: auto set availability based on stock
foodItemSchema.pre('save', function (next) {
  if (this.stockQuantity === 0) {
    this.isAvailable = false;
  }
  next();
});

foodItemSchema.set('toJSON', { virtuals: true });
foodItemSchema.set('toObject', { virtuals: true });

// Index for search
foodItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);
