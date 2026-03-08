const FoodItem = require('../../models/inventory/FoodItem');
const StockAlert = require('../../models/inventory/StockAlert');

// @desc    Update stock quantity
// @route   PATCH /api/inventory/:id/stock
// @access  Private
exports.updateStock = async (req, res) => {
    try {
        const { quantity, operation, threshold } = req.body;
        // operation: 'set' | 'add' | 'subtract'
        const item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });

        const prevStock = item.stockQuantity;
        let newStock = prevStock;

        if (operation === 'set') newStock = parseInt(quantity);
        else if (operation === 'add') newStock = prevStock + parseInt(quantity);
        else if (operation === 'subtract') newStock = Math.max(0, prevStock - parseInt(quantity));
        else newStock = parseInt(quantity);

        item.stockQuantity = newStock;
        if (threshold !== undefined) item.lowStockThreshold = parseInt(threshold);

        // Auto-manage availability
        if (newStock === 0) item.isAvailable = false;
        else if (prevStock === 0 && newStock > 0) item.isAvailable = true;

        await item.save();

        // Helper to create alerts (moved inside to avoid external dependency for now, or could be a separate helper)
        const createAlert = async (type, message) => {
            const existing = await StockAlert.findOne({ foodItem: item._id, alertType: type, isResolved: false });
            if (!existing) {
                await StockAlert.create({
                    foodItem: item._id, alertType: type, message,
                    currentStock: newStock, threshold: item.lowStockThreshold
                });
            }
        };

        if (newStock === 0 && prevStock > 0) {
            await StockAlert.updateMany({ foodItem: item._id, alertType: 'low_stock', isResolved: false }, { isResolved: true });
            await createAlert('out_of_stock', `"${item.name}" is OUT OF STOCK.`);
        } else if (newStock > 0 && newStock <= item.lowStockThreshold) {
            await createAlert('low_stock', `"${item.name}" is running low. Only ${newStock} remaining (threshold: ${item.lowStockThreshold}).`);
        } else if (newStock > item.lowStockThreshold && prevStock <= item.lowStockThreshold) {
            await StockAlert.updateMany({ foodItem: item._id, isResolved: false }, { isResolved: true });
            await createAlert('restocked', `"${item.name}" restocked. Current stock: ${newStock}.`);
        }

        await item.populate('category');
        res.json({ success: true, message: 'Stock updated successfully', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Full inventory overview
// @route   GET /api/inventory/overview
// @access  Private
exports.getInventoryOverview = async (req, res) => {
    try {
        const items = await FoodItem.find()
            .populate('category')
            .sort({ stockQuantity: 1 });

        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Bulk stock update
// @route   PATCH /api/inventory/bulk-update
// @access  Private
exports.bulkUpdateStock = async (req, res) => {
    try {
        const { updates } = req.body; // [{ id, quantity }]
        const results = [];

        for (const update of updates) {
            const item = await FoodItem.findByIdAndUpdate(
                update.id,
                { stockQuantity: update.quantity },
                { new: true }
            );
            if (item) results.push(item);
        }

        res.json({ success: true, message: `Updated ${results.length} items`, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reserve stock (on add to cart)
// @route   POST /api/inventory/:id/reserve
// @access  Public
exports.reserveStock = async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });

        if (item.stockQuantity < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock available' });
        }

        const prevStock = item.stockQuantity;
        item.stockQuantity -= quantity;

        // Auto-manage availability
        if (item.stockQuantity === 0) item.isAvailable = false;

        await item.save();

        // Handle alerts
        if (item.stockQuantity === 0 && prevStock > 0) {
            const existing = await StockAlert.findOne({ foodItem: item._id, alertType: 'out_of_stock', isResolved: false });
            if (!existing) {
                await StockAlert.create({
                    foodItem: item._id, alertType: 'out_of_stock', message: `"${item.name}" is OUT OF STOCK.`,
                    currentStock: 0, threshold: item.lowStockThreshold
                });
            }
        } else if (item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold) {
            const existing = await StockAlert.findOne({ foodItem: item._id, alertType: 'low_stock', isResolved: false });
            if (!existing) {
                await StockAlert.create({
                    foodItem: item._id, alertType: 'low_stock', message: `"${item.name}" is running low. Only ${item.stockQuantity} remaining.`,
                    currentStock: item.stockQuantity, threshold: item.lowStockThreshold
                });
            }
        }

        res.json({ success: true, message: 'Stock reserved successfully', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Release stock (on remove from cart/cancel)
// @route   POST /api/inventory/:id/release
// @access  Public
exports.releaseStock = async (req, res) => {
    try {
        const { quantity = 1 } = req.body;
        const item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });

        const prevStock = item.stockQuantity;
        item.stockQuantity += quantity;

        // Auto-manage availability
        if (prevStock === 0 && item.stockQuantity > 0) item.isAvailable = true;

        await item.save();

        // Resovle out of stock alert if it was out of stock
        if (prevStock === 0 && item.stockQuantity > 0) {
            await StockAlert.updateMany({ foodItem: item._id, alertType: 'out_of_stock', isResolved: false }, { isResolved: true });
        }

        res.json({ success: true, message: 'Stock released successfully', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
