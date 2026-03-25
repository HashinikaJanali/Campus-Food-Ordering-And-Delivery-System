const express = require('express');
const router = express.Router();
const analyticsController = require('../../Controllers/inventory/analyticsController');
const { protect } = require('../../middleware/auth');

// Get data for dashboard charts
router.get('/overview', protect, analyticsController.getAnalyticsOverview);

// Get data for CSV export
router.get('/report', protect, analyticsController.getAnalyticsReport);

module.exports = router;
