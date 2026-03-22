const StockAlert = require('../../Model/inventory/StockAlert');

// Get all alerts
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

// Mark alert as read
exports.markAsRead = async (req, res) => {
    try {
        const alert = await StockAlert.findByIdAndUpdate(req.params.id, { isRead: true }, { returnDocument: 'after' });
        res.json({ success: true, data: alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Mark all alerts as read
exports.markAllRead = async (req, res) => {
    try {
        await StockAlert.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All alerts marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Resolve alert
exports.resolveAlert = async (req, res) => {
    try {
        const alert = await StockAlert.findByIdAndUpdate(req.params.id, { isResolved: true, isRead: true }, { returnDocument: 'after' });
        res.json({ success: true, data: alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Clear resolved alerts
exports.clearResolved = async (req, res) => {
    try {
        await StockAlert.deleteMany({ isResolved: true });
        res.json({ success: true, message: 'Cleared all resolved alerts' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
