const express = require('express');
const router = express.Router();
const categoryController = require('../../Controllers/inventory/categoryController');
const authMiddleware = require('../../middleware/auth');

// Get all categories
router.get('/', categoryController.getCategories);

// Create new category
router.post('/', authMiddleware, categoryController.createCategory);

// Update category
router.put('/:id', authMiddleware, categoryController.updateCategory);

// Delete category
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
