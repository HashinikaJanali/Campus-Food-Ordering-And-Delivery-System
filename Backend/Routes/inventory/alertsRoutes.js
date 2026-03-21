const express = require('express');
const router = express.Router();
const alertController = require('../../controllers/inventory/alertController');
const authMiddleware = require('../../middleware/auth');

// Get all alerts
router.get('/', authMiddleware, alertController.getAlerts);

// Mark as read
router.patch('/:id/read', authMiddleware, alertController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', authMiddleware, alertController.markAllRead);

// Resolved alerts
router.patch('/:id/resolve', authMiddleware, alertController.resolveAlert);

// Delete resolved alerts
router.delete('/clear-resolved', authMiddleware, alertController.clearResolved);

module.exports = router;
