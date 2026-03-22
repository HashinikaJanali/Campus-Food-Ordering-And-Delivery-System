const StockAlert = require('../../models/inventory/StockAlert');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
    try {
        const { isRead, isResolved, limit = 50 } = req.query;
        const filter = {};
        if (isRead !== undefined) filter.isRead = isRead === 'true';
        if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

        const alerts = await StockAlert.find(filter)
            .populate('foodItem', 'name image stockQuantity')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await StockAlert.countDocuments({ isRead: false, isResolved: false });

        res.json({ success: true, data: alerts, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Mark alert as read
// @route   PATCH /api/alerts/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const alert = await StockAlert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.json({ success: true, data: alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Mark all alerts as read
// @route   PATCH /api/alerts/mark-all-read
// @access  Private
exports.markAllRead = async (req, res) => {
    try {
        await StockAlert.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All alerts marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Resolve alert
// @route   PATCH /api/alerts/:id/resolve
// @access  Private
exports.resolveAlert = async (req, res) => {
    try {
        const alert = await StockAlert.findByIdAndUpdate(req.params.id, { isResolved: true, isRead: true }, { new: true });
        res.json({ success: true, data: alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Clear resolved alerts
// @route   DELETE /api/alerts/clear-resolved
// @access  Private
exports.clearResolved = async (req, res) => {
    try {
        await StockAlert.deleteMany({ isResolved: true });
        res.json({ success: true, message: 'Cleared all resolved alerts' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
