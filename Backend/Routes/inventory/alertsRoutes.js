const express = require('express');
const router = express.Router();
const alertController = require('../../Controllers/inventory/alertController');
const { protect } = require('../../middleware/auth');

// Get all alerts
router.get('/', protect, alertController.getAlerts);

// Mark as read
router.patch('/:id/read', protect, alertController.markAsRead);

// Mark all as read
router.patch('/mark-all-read', protect, alertController.markAllRead);

// Resolved alerts
router.patch('/:id/resolve', protect, alertController.resolveAlert);

// Delete resolved alerts
router.delete('/clear-resolved', protect, alertController.clearResolved);

module.exports = router;
