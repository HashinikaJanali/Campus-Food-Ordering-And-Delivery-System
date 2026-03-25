const express = require('express');
const router = express.Router();
const foodItemController = require('../../Controllers/inventory/foodItemController');
const { protect } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Create food item
router.post('/', protect, upload.single('image'), foodItemController.createFoodItem);

// Get all food items (admin)
router.get('/', foodItemController.getFoodItems);

// Get public menu (students view)
router.get('/public', foodItemController.getPublicMenu);

// Get dashboard stats
router.get('/stats', protect, foodItemController.getFoodItemStats);

// Get single item
router.get('/:id', foodItemController.getFoodItemById);

// Update food item
router.put('/:id', protect, upload.single('image'), foodItemController.updateFoodItem);

// Toggle menu visibility
router.patch('/:id/toggle-menu', protect, foodItemController.toggleMenuVisibility);

// Toggle availability
router.patch('/:id/toggle-availability', protect, foodItemController.toggleAvailability);

// Delete food item
router.delete('/:id', protect, foodItemController.deleteFoodItem);

module.exports = router;
