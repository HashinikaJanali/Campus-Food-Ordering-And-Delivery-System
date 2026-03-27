const FoodItem = require('../../Model/inventory/FoodItem');
const StockAlert = require('../../Model/inventory/StockAlert');
const alertService = require('../../services/alertService');

// Update stock quantity
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

        // Emit stock update
        const io = req.app.get('io');
        if (io) {
            io.emit('stockUpdate', { foodItemId: item._id, stockQuantity: item.stockQuantity });
        }

        // Use centralized alert service
        await alertService.checkStockAlerts(item, prevStock, req.app.get('io'));

        await item.populate('category');
        res.json({ success: true, message: 'Stock updated successfully', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Full inventory overview
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

// Bulk stock update
exports.bulkUpdateStock = async (req, res) => {
    try {
        const { updates } = req.body; // [{ id, quantity }]
        const results = [];

        for (const update of updates) {
            const item = await FoodItem.findByIdAndUpdate(
                update.id,
                { stockQuantity: update.quantity },
                { returnDocument: 'after' }
            );
            if (item) {
                results.push(item);
                // Emit stock update
                const io = req.app.get('io');
                if (io) {
                    io.emit('stockUpdate', { foodItemId: item._id, stockQuantity: item.stockQuantity });
                }
            }
        }

        res.json({ success: true, message: `Updated ${results.length} items`, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Reserve stock (on add to cart)
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

        // Emit stock update
        const io = req.app.get('io');
        if (io) {
            io.emit('stockUpdate', { foodItemId: item._id, stockQuantity: item.stockQuantity });
        }

        // Use centralized alert service
        await alertService.checkStockAlerts(item, prevStock, req.app.get('io'));

        res.json({ success: true, message: 'Stock reserved successfully', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Release stock (on remove from cart/cancel)
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

        // Emit stock update
        const io = req.app.get('io');
        if (io) {
            io.emit('stockUpdate', { foodItemId: item._id, stockQuantity: item.stockQuantity });
        }

        // Use centralized alert service
        await alertService.checkStockAlerts(item, prevStock, req.app.get('io'));

        res.json({ success: true, message: 'Stock released successfully', data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
