const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_food_inventory';

const Order = require('./Model/Order');
const RefundRequest = require('./Model/RefundRequest');

const emailToClear = 'ushathagreat@gmail.com';

async function clearOrderHistory() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all orders for this user
    const orders = await Order.find({ customerEmail: emailToClear });
    console.log(`\n📦 Found ${orders.length} orders for ${emailToClear}`);

    if (orders.length === 0) {
      console.log('No orders found for this user.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Get order IDs for refund request cleanup
    const orderIds = orders.map(o => o._id.toString());

    // Delete refund requests related to these orders
    const refundsDeleted = await RefundRequest.deleteMany({
      orderId: { $in: orderIds }
    });
    console.log(`🗑️  Deleted ${refundsDeleted.deletedCount} refund requests`);

    // Delete all orders for this user
    const result = await Order.deleteMany({ customerEmail: emailToClear });
    console.log(`🗑️  Deleted ${result.deletedCount} orders`);

    console.log(`\n✅ Successfully cleared all order history for ${emailToClear}`);
    console.log(`   - Orders deleted: ${result.deletedCount}`);
    console.log(`   - Refund requests deleted: ${refundsDeleted.deletedCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing order history:', err);
    process.exit(1);
  }
}

clearOrderHistory();
