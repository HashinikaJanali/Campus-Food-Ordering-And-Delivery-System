const Cart = require('../Model/Cart');
const FoodItem = require('../Model/inventory/FoodItem');
const alertService = require('../services/alertService');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.foodItem').populate('items.canteen');
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { foodItemId, quantity = 1 } = req.body;

    // Get food item details
    const foodItem = await FoodItem.findById(foodItemId).populate('canteen');
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Check if item is available
    if (foodItem.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stockQuantity' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item =>
      item.foodItem.toString() === foodItemId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        foodItem: foodItemId,
        quantity,
        price: foodItem.price,
        name: foodItem.name,
        image: foodItem.image,
        canteen: foodItem.canteen
      });
    }

    const prevStock = foodItem.stockQuantity;
    foodItem.stockQuantity -= quantity;
    await foodItem.save();

    // Check for alerts
    await alertService.checkStockAlerts(foodItem, prevStock, req.app.get('io'));

    // Emit stock update
    const io = req.app.get('io');
    if (io) {
      io.emit('stockUpdate', { foodItemId: foodItem._id, stockQuantity: foodItem.stockQuantity });
    }

    await cart.save();
    await cart.populate([{ path: 'items.foodItem' }, { path: 'items.canteen' }]);

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { foodItemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item =>
      item.foodItem.toString() === foodItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const oldQuantity = cart.items[itemIndex].quantity;
    const quantityDifference = quantity - oldQuantity;

    // Check stockQuantity availability
    const foodItem = await FoodItem.findById(foodItemId);
    if (foodItem.stockQuantity < quantityDifference) {
      return res.status(400).json({ message: 'Insufficient stockQuantity' });
    }

    if (quantity <= 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
      // Return stockQuantity
      foodItem.stockQuantity += oldQuantity;
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      // Update stockQuantity
      foodItem.stockQuantity -= quantityDifference;
    }

    await foodItem.save();

    // Check for alerts
    await alertService.checkStockAlerts(foodItem, oldQuantity, req.app.get('io')); // oldQuantity is correct prevStock here

    // Emit stock update
    const io = req.app.get('io');
    if (io) {
      io.emit('stockUpdate', { foodItemId: foodItem._id, stockQuantity: foodItem.stockQuantity });
    }

    await cart.save();
    await cart.populate([{ path: 'items.foodItem' }, { path: 'items.canteen' }]);

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { foodItemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item =>
      item.foodItem.toString() === foodItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const removedQuantity = cart.items[itemIndex].quantity;

    const prevStock = foodItem.stockQuantity;
    foodItem.stockQuantity += removedQuantity;
    await foodItem.save();

    // Check for alerts
    await alertService.checkStockAlerts(foodItem, prevStock, req.app.get('io'));

    // Emit stock update
    const io = req.app.get('io');
    if (io) {
      io.emit('stockUpdate', { foodItemId: foodItem._id, stockQuantity: foodItem.stockQuantity });
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate([{ path: 'items.foodItem' }, { path: 'items.canteen' }]);

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const { preserveStock } = req.query;
    const isPreserveStock = preserveStock === 'true';

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.json({ message: 'Cart is already empty' });
    }

    if (!isPreserveStock) {
      // Return all stockQuantity
      for (const item of cart.items) {
        const foodItem = await FoodItem.findById(item.foodItem);
        if (foodItem) {
          const prevStock = foodItem.stockQuantity;
          foodItem.stockQuantity += item.quantity;
          await foodItem.save();

          // Check for alerts
          await alertService.checkStockAlerts(foodItem, prevStock, req.app.get('io'));

          // Emit stock update for each item
          const io = req.app.get('io');
          if (io) {
            io.emit('stockUpdate', { foodItemId: foodItem._id, stockQuantity: foodItem.stockQuantity });
          }
        }
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};