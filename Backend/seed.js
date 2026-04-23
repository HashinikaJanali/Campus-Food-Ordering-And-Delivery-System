const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_food_inventory';

const Admin = require('./Model/Admin');
const User = require('./Model/User');
const Category = require('./Model/inventory/Category');
const FoodItem = require('./Model/inventory/FoodItem');
const Canteen = require('./Model/inventory/Canteen');

const categories = [
  { name: 'Rice & Curry', icon: '🍛', description: 'Traditional Sri Lankan rice and curry meals', displayOrder: 1 },
  { name: 'Short Eats', icon: '🥐', description: 'Quick bites and snacks', displayOrder: 2 },
  { name: 'Burgers & Sandwiches', icon: '🍔', description: 'Burgers, subs and sandwiches', displayOrder: 3 },
  { name: 'Beverages', icon: '🥤', description: 'Drinks and refreshments', displayOrder: 4 },
  { name: 'Desserts', icon: '🍰', description: 'Sweet treats and desserts', displayOrder: 5 },
  { name: 'Noodles', icon: '🍜', description: 'Noodle dishes and stir fries', displayOrder: 6 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Admin.deleteMany({});
  await User.deleteMany({});
  await Category.deleteMany({});
  await FoodItem.deleteMany({});
  await Canteen.deleteMany({});

  // Create admin
  const admin = await Admin.create({
    name: 'Admin User',
    email: 'admin@campus.edu',
    password: 'admin123',
    role: 'super_admin'
  });
  console.log('✅ Admin created: admin@campus.edu / admin123');
  
  // Create demo user
  const demoUser = await User.create({
    name: 'Student',
    email: 'user@campus.edu',
    password: 'user123',
    role: 'student'
  });
  console.log('✅ Demo Student created: user@campus.edu / user123');

  // Create delivery staff user
  const deliveryStaff = await User.create({
    name: 'Delivery Agent',
    email: 'delivery@campus.edu',
    password: 'staff123',
    role: 'staff'
  });
  console.log('✅ Delivery Staff created: delivery@campus.edu / staff123');

  // Create canteens
  const canteenNames = ['P&S', 'Anohana', 'Basement Canteen', 'New building canteen'];
  const createdCanteens = await Canteen.insertMany(canteenNames.map(name => ({ name, isActive: true })));
  console.log(`✅ ${createdCanteens.length} canteens created`);
  const canteenMap = {};
  createdCanteens.forEach(c => { canteenMap[c.name] = c._id; });

  // Create categories
  const createdCats = await Category.insertMany(categories);
  console.log(`✅ ${createdCats.length} categories created`);

  const catMap = {};
  createdCats.forEach(c => { catMap[c.name] = c._id; });

  // Create food items
  const foodItems = [
    { name: 'Rice & Curry Combo', description: 'Full meal with rice, 3 curries, and papadam', price: 280, category: catMap['Rice & Curry'], canteen: canteenMap['P&S'], stockQuantity: 50, lowStockThreshold: 10, preparationTime: 10, isVegetarian: false, isMenuVisible: true, tags: ['popular', 'filling'], nutritionInfo: { calories: 650, protein: 28, carbs: 80, fat: 18 }, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=800' },
    { name: 'Vegetable Rice & Curry', description: 'Rice with assorted vegetable curries', price: 220, category: catMap['Rice & Curry'], canteen: canteenMap['Anohana'], stockQuantity: 35, lowStockThreshold: 8, preparationTime: 10, isVegetarian: true, isMenuVisible: true, tags: ['veg', 'healthy'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Chicken Fried Rice', description: 'Wok-fried rice with chicken and vegetables', price: 320, category: catMap['Rice & Curry'], canteen: canteenMap['Basement Canteen'], stockQuantity: 8, lowStockThreshold: 10, preparationTime: 15, isMenuVisible: true, tags: ['popular', 'spicy'], image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800' },
    { name: 'Kottu Roti', description: 'Shredded godamba roti stir-fried with vegetables and egg', price: 350, category: catMap['Noodles'], canteen: canteenMap['New building canteen'], stockQuantity: 20, lowStockThreshold: 5, preparationTime: 20, isMenuVisible: true, tags: ['spicy', 'popular'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800' },
    { name: 'Egg Kottu', description: 'Kottu roti with egg gravy', price: 380, category: catMap['Noodles'], canteen: canteenMap['P&S'], stockQuantity: 15, lowStockThreshold: 5, preparationTime: 20, isMenuVisible: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800' },
    { name: 'Chicken Burger', description: 'Crispy fried chicken in a toasted bun with lettuce and sauce', price: 450, category: catMap['Burgers & Sandwiches'], canteen: canteenMap['Anohana'], stockQuantity: 12, lowStockThreshold: 5, preparationTime: 15, isMenuVisible: true, tags: ['bestseller'], image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800' },
    { name: 'Veggie Burger', description: 'Spiced vegetable patty in a whole wheat bun', price: 380, category: catMap['Burgers & Sandwiches'], canteen: canteenMap['Basement Canteen'], stockQuantity: 0, lowStockThreshold: 5, preparationTime: 15, isVegetarian: true, isMenuVisible: true, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800' },
    { name: 'Club Sandwich', description: 'Triple-decker sandwich with chicken, egg, and veggies', price: 420, category: catMap['Burgers & Sandwiches'], canteen: canteenMap['New building canteen'], stockQuantity: 18, lowStockThreshold: 5, preparationTime: 10, isMenuVisible: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800' },
    { name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced vegetables', price: 120, category: catMap['Short Eats'], canteen: canteenMap['P&S'], stockQuantity: 60, lowStockThreshold: 15, preparationTime: 5, isVegetarian: true, isMenuVisible: true, tags: ['snack', 'veg'], image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800' },
    { name: 'Cutlet (2 pcs)', description: 'Breaded fish or chicken cutlets', price: 160, category: catMap['Short Eats'], canteen: canteenMap['Anohana'], stockQuantity: 45, lowStockThreshold: 10, preparationTime: 5, isMenuVisible: true, tags: ['snack', 'popular'], image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800' },
    { name: 'Egg Roll', description: 'Egg wrapped in roti with chili sauce', price: 180, category: catMap['Short Eats'], canteen: canteenMap['Basement Canteen'], stockQuantity: 3, lowStockThreshold: 8, preparationTime: 10, isMenuVisible: true, image: 'https://dinnersdishesanddesserts.com/wp-content/uploads/2021/12/Vietnamese-Egg-Rolls-9-731x1024.jpg' },
    { name: 'Iced Coffee', description: 'Cold brewed coffee with milk and caramel', price: 250, category: catMap['Beverages'], canteen: canteenMap['New building canteen'], stockQuantity: 40, lowStockThreshold: 10, preparationTime: 3, isMenuVisible: true, tags: ['cold', 'coffee'], image: 'https://auntymeals.com/wp-content/uploads/2025/09/Caramel-Iced-Coffee-recipe-500x500.jpg' },
    { name: 'Fresh Lime Juice', description: 'Freshly squeezed lime with mint and soda', price: 150, category: catMap['Beverages'], canteen: canteenMap['P&S'], stockQuantity: 55, lowStockThreshold: 10, preparationTime: 3, isVegetarian: true, isMenuVisible: true, tags: ['fresh', 'cold'], image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800' },
    { name: 'Mango Smoothie', description: 'Blended fresh mango with yogurt and honey', price: 280, category: catMap['Beverages'], canteen: canteenMap['Anohana'], stockQuantity: 0, lowStockThreshold: 10, preparationTime: 5, isVegetarian: true, isMenuVisible: true, tags: ['fruity', 'healthy'], image: 'https://www.eatloveeats.com/wp-content/uploads/2023/04/Orange-Mango-Smoothie-Featured.jpg' },
    { name: 'Chocolate Cake Slice', description: 'Rich dark chocolate layer cake', price: 350, category: catMap['Desserts'], canteen: canteenMap['Basement Canteen'], stockQuantity: 14, lowStockThreshold: 5, preparationTime: 2, isVegetarian: true, isMenuVisible: true, tags: ['sweet', 'popular'], image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800' },
    { name: 'Watalappam', description: 'Traditional Sri Lankan coconut custard pudding', price: 280, category: catMap['Desserts'], canteen: canteenMap['New building canteen'], stockQuantity: 8, lowStockThreshold: 5, preparationTime: 2, isVegetarian: true, isMenuVisible: true, tags: ['traditional', 'sweet'], image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800' },  ];

  const created = await FoodItem.insertMany(foodItems);
  console.log(`✅ ${created.length} food items created`);

  console.log('\n🎉 Seed complete!');
  console.log('Admin login: admin@campus.edu / admin123');
  console.log('User login:  user@campus.edu / user123');
  console.log('Staff login: delivery@campus.edu / staff123');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
