const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/inventory/analyticsController');
const authMiddleware = require('../../middleware/auth');

// GET /api/analytics/overview - Data for dashboard charts
router.get('/overview', authMiddleware, analyticsController.getAnalyticsOverview);

// GET /api/analytics/report - Data for CSV export
router.get('/report', authMiddleware, analyticsController.getAnalyticsReport);

module.exports = router;
