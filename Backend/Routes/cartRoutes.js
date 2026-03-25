// @ts-nocheck
const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');
const { protectUser } = require('../middleware/auth');

// All cart routes require authentication
router.use(protectUser);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update cart item quantity
router.put('/update', cartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:foodItemId', cartController.removeFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

module.exports = router;