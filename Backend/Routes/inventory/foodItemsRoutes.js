const express = require('express');
const router = express.Router();
const foodItemController = require('../../controllers/inventory/foodItemController');
const authMiddleware = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// POST /api/food-items - Create food item
router.post('/', authMiddleware, upload.single('image'), foodItemController.createFoodItem);

// GET /api/food-items - Get all food items (admin)
router.get('/', foodItemController.getFoodItems);

// GET /api/food-items/public - Public menu (students view)
router.get('/public', foodItemController.getPublicMenu);

// GET /api/food-items/stats - Dashboard stats
router.get('/stats', authMiddleware, foodItemController.getFoodItemStats);

// GET /api/food-items/:id - Get single item
router.get('/:id', foodItemController.getFoodItemById);

// PUT /api/food-items/:id - Update food item
router.put('/:id', authMiddleware, upload.single('image'), foodItemController.updateFoodItem);

// PATCH /api/food-items/:id/toggle-menu - Toggle menu visibility
router.patch('/:id/toggle-menu', authMiddleware, foodItemController.toggleMenuVisibility);

// PATCH /api/food-items/:id/toggle-availability - Toggle availability
router.patch('/:id/toggle-availability', authMiddleware, foodItemController.toggleAvailability);

// DELETE /api/food-items/:id - Delete food item
router.delete('/:id', authMiddleware, foodItemController.deleteFoodItem);

module.exports = router;
