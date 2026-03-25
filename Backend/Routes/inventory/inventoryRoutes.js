const express = require('express');
const router = express.Router();
const inventoryController = require('../../Controllers/inventory/inventoryController');
const { protect } = require('../../middleware/auth');

// Update stock quantity
router.patch('/:id/stock', protect, inventoryController.updateStock);

// Get full inventory overview
router.get('/overview', protect, inventoryController.getInventoryOverview);

// Bulk stock update
router.patch('/bulk-update', protect, inventoryController.bulkUpdateStock);

// Reserve stock (Public for students)
router.post('/:id/reserve', inventoryController.reserveStock);

// Release stock (Public for students)
router.post('/:id/release', inventoryController.releaseStock);

module.exports = router;
