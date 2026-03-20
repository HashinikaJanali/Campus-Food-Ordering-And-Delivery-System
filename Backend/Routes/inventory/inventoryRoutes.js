const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/inventory/inventoryController');
const authMiddleware = require('../../middleware/auth');

// PATCH /api/inventory/:id/stock - Update stock quantity
router.patch('/:id/stock', authMiddleware, inventoryController.updateStock);

// GET /api/inventory/overview - Full inventory overview
router.get('/overview', authMiddleware, inventoryController.getInventoryOverview);

// PATCH /api/inventory/bulk-update - Bulk stock update
router.patch('/bulk-update', authMiddleware, inventoryController.bulkUpdateStock);

// POST /api/inventory/:id/reserve - Reserve stock (Public for students)
router.post('/:id/reserve', inventoryController.reserveStock);

// POST /api/inventory/:id/release - Release stock (Public for students)
router.post('/:id/release', inventoryController.releaseStock);

module.exports = router;
