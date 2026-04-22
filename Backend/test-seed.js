const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_food_inventory';

// Models
const User = require('./Model/User');
const Order = require('./Model/Order'); 
const FoodItem = require('./Model/inventory/FoodItem');
const Review = require('./Model/Review');
const LoyaltyPoints = require('./Model/LoyaltyPoints');

async function testSeed() {
  console.log('⏳ Connecting to MongoDB for test seeding...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }

  // 1. Find the test user
  const user = await User.findOne({ email: 'user@campus.edu' });
  if (!user) {
    console.error('❌ Test user not found. Please run seed.js first.');
    process.exit(1);
  }

  // 2. Clear existing test-specific data
  console.log('🧹 Clearing old test data for user@campus.edu...');
  await Review.deleteMany({ customerEmail: 'user@campus.edu' }); // Some reviews might identify by email
  await Review.deleteMany({ userId: user._id.toString() });
  
  await LoyaltyPoints.deleteMany({ userId: user._id.toString() });
  await Order.deleteMany({ customerEmail: 'user@campus.edu' });

  // 3. Create initial Loyalty record
  await LoyaltyPoints.create({
    userId: user._id.toString(),
    userName: user.name || 'Student',
    totalPoints: 50,
    history: [{
      type: 'earned',
      amount: 50,
      description: 'Initial test points',
      date: new Date()
    }]
  });
  console.log('✅ Loyalty record created');

  // 4. Create some "Delivered" orders
  const foodItems = await FoodItem.find().limit(3);
  if (foodItems.length > 0) {
    const orders = foodItems.map((item, i) => {
      // Create items array compatible with Order schema
      const items = [{
        name: item.name,
        quantity: 1,
        price: item.price,
        image: item.image
      }];
      
      return {
        customerEmail: 'user@campus.edu',
        customerName: 'Student',
        userId: user._id.toString(),
        items: items,
        totalAmount: item.price,
        orderStatus: 'Delivered',
        status: 'delivered',
        paymentStatus: 'Completed',
        canteenName: 'P&S Canteen',
        addressType: 'on-campus',
        createdAt: new Date(Date.now() - (i + 1) * 3600000), // 1, 2, 3 hours ago
      };
    });
    
    // Using create() to trigger pre-validate hooks (orderId generation)
    await Order.create(orders);
    console.log(`✅ ${orders.length} test orders created`);
  } else {
    console.warn('⚠️ No food items found to create test orders.');
  }

  console.log('🎉 Test seeding complete!');
  process.exit(0);
}

testSeed().catch(err => {
  console.error('❌ Test seed failed:', err);
  process.exit(1);
});
