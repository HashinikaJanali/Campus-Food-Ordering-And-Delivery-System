const express = require('express');
const router = express.Router();
const inventoryController = require('../../Controllers/inventory/inventoryController');
const authMiddleware = require('../../middleware/auth');

// Update stock quantity
router.patch('/:id/stock', authMiddleware, inventoryController.updateStock);

// Get full inventory overview
router.get('/overview', authMiddleware, inventoryController.getInventoryOverview);

// Bulk stock update
router.patch('/bulk-update', authMiddleware, inventoryController.bulkUpdateStock);

// Reserve stock (Public for students)
router.post('/:id/reserve', inventoryController.reserveStock);

// Release stock (Public for students)
router.post('/:id/release', inventoryController.releaseStock);

module.exports = router;
