const express = require('express');
const router = express.Router();
const foodItemController = require('../../controllers/inventory/foodItemController');
const authMiddleware = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Create food item
router.post('/', authMiddleware, upload.single('image'), foodItemController.createFoodItem);

// Get all food items (admin)
router.get('/', foodItemController.getFoodItems);

// Get public menu (students view)
router.get('/public', foodItemController.getPublicMenu);

// Get dashboard stats
router.get('/stats', authMiddleware, foodItemController.getFoodItemStats);

// Get single item
router.get('/:id', foodItemController.getFoodItemById);

// Update food item
router.put('/:id', authMiddleware, upload.single('image'), foodItemController.updateFoodItem);

// Toggle menu visibility
router.patch('/:id/toggle-menu', authMiddleware, foodItemController.toggleMenuVisibility);

// Toggle availability
router.patch('/:id/toggle-availability', authMiddleware, foodItemController.toggleAvailability);

// Delete food item
router.delete('/:id', authMiddleware, foodItemController.deleteFoodItem);

module.exports = router;
