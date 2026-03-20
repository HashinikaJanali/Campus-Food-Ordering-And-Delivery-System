const express = require('express');
const router = express.Router();
const alertController = require('../../controllers/inventory/alertController');
const authMiddleware = require('../../middleware/auth');

// GET all alerts
router.get('/', authMiddleware, alertController.getAlerts);

// PATCH /api/alerts/:id/read - Mark as read
router.patch('/:id/read', authMiddleware, alertController.markAsRead);

// PATCH /api/alerts/mark-all-read - Mark all as read
router.patch('/mark-all-read', authMiddleware, alertController.markAllRead);

// PATCH /api/alerts/:id/resolve
router.patch('/:id/resolve', authMiddleware, alertController.resolveAlert);

// DELETE /api/alerts/clear-resolved
router.delete('/clear-resolved', authMiddleware, alertController.clearResolved);

module.exports = router;
