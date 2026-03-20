const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/inventory/categoryController');
const authMiddleware = require('../../middleware/auth');

// GET all categories
router.get('/', categoryController.getCategories);

// POST create category
router.post('/', authMiddleware, categoryController.createCategory);

// PUT update category
router.put('/:id', authMiddleware, categoryController.updateCategory);

// DELETE category
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;
