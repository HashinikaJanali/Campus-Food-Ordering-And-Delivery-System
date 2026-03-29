const StockAlert = require('../Model/inventory/StockAlert');

/**
 * Checks the stock level of a food item and creates appropriate alerts.
 * Handles out_of_stock, low_stock, and restocked transitions.
 */
exports.checkStockAlerts = async (foodItem, prevStock, io) => {
    try {
        const newStock = foodItem.stockQuantity;
        const threshold = foodItem.lowStockThreshold;
        let alertChanged = false;

        // 1. Transition to OUT OF STOCK
        if (newStock === 0 && (prevStock === undefined || prevStock > 0)) {
            // Resolve any existing low stock alerts for this item
            const res = await StockAlert.updateMany(
                { foodItem: foodItem._id, alertType: 'low_stock', isResolved: false },
                { isResolved: true }
            );
            if (res.modifiedCount > 0) alertChanged = true;

            // Create out of stock alert if not exists
            const existing = await StockAlert.findOne({
                foodItem: foodItem._id,
                alertType: 'out_of_stock',
                isResolved: false
            });

            if (!existing) {
                await StockAlert.create({
                    foodItem: foodItem._id,
                    alertType: 'out_of_stock',
                    message: `"${foodItem.name}" is now OUT OF STOCK (0 remaining).`,
                    currentStock: 0,
                    threshold: threshold
                });
                alertChanged = true;
            }
        } 
        
        // 2. Transition to LOW STOCK
        else if (newStock > 0 && newStock <= threshold) {
            // Create low stock alert if not exists
            const existing = await StockAlert.findOne({
                foodItem: foodItem._id,
                alertType: 'low_stock',
                isResolved: false
            });

            if (!existing) {
                await StockAlert.create({
                    foodItem: foodItem._id,
                    alertType: 'low_stock',
                    message: `"${foodItem.name}" is running LOW on stock. Only ${newStock} left (threshold: ${threshold}).`,
                    currentStock: newStock,
                    threshold: threshold
                });
                alertChanged = true;
            } else if (existing.currentStock !== newStock) {
                // Update existing alert with current stock
                existing.currentStock = newStock;
                existing.message = `"${foodItem.name}" is running LOW on stock. Only ${newStock} left (threshold: ${threshold}).`;
                await existing.save();
                alertChanged = true;
            }
        }

        // 3. Transition to RESTOCKED (In Stock)
        else if (newStock > threshold && (prevStock !== undefined && prevStock <= threshold)) {
            // Resolve ALL unresolved alerts for this item
            const res = await StockAlert.updateMany(
                { foodItem: foodItem._id, isResolved: false },
                { isResolved: true }
            );
            if (res.modifiedCount > 0) alertChanged = true;

            // Create restocked notification
            await StockAlert.create({
                foodItem: foodItem._id,
                alertType: 'restocked',
                message: `"${foodItem.name}" has been restocked. Current stock: ${newStock}.`,
                currentStock: newStock,
                threshold: threshold
            });
            alertChanged = true;
        }

        // Emit socket update if something changed
        if (alertChanged && io) {
            io.emit('alertUpdate');
        }
    } catch (error) {
        console.error('Error in checkStockAlerts:', error);
    }
};
