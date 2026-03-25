const Cart = require('../Model/Cart');
const FoodItem = require('../Model/inventory/FoodItem');

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
    if (foodItem.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
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

    // Update stock
    foodItem.stock -= quantity;
    await foodItem.save();

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

    // Check stock availability
    const foodItem = await FoodItem.findById(foodItemId);
    if (foodItem.stock < quantityDifference) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (quantity <= 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
      // Return stock
      foodItem.stock += oldQuantity;
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      // Update stock
      foodItem.stock -= quantityDifference;
    }

    await foodItem.save();
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

    // Return stock
    const foodItem = await FoodItem.findById(foodItemId);
    foodItem.stock += removedQuantity;
    await foodItem.save();

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
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.json({ message: 'Cart is already empty' });
    }

    // Return all stock
    for (const item of cart.items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      foodItem.stock += item.quantity;
      await foodItem.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};