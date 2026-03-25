const express = require('express');
const router = express.Router();
const categoryController = require('../../Controllers/inventory/categoryController');
const { protect } = require('../../middleware/auth');

// Get all categories
router.get('/', categoryController.getCategories);

// Create new category
router.post('/', protect, categoryController.createCategory);

// Update category
router.put('/:id', protect, categoryController.updateCategory);

// Delete category
router.delete('/:id', protect, categoryController.deleteCategory);

module.exports = router;
