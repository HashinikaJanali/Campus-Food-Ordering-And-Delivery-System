const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/inventory/analyticsController');
const authMiddleware = require('../../middleware/auth');

// Get data for dashboard charts
router.get('/overview', authMiddleware, analyticsController.getAnalyticsOverview);

// Get data for CSV export
router.get('/report', authMiddleware, analyticsController.getAnalyticsReport);

module.exports = router;
