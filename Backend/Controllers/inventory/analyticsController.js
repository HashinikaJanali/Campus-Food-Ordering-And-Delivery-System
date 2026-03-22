const FoodItem = require('../../models/inventory/FoodItem');
const Category = require('../../models/inventory/Category');

// @desc    Data for dashboard charts
// @route   GET /api/analytics/overview
// @access  Private
exports.getAnalyticsOverview = async (req, res) => {
    try {
        // 1. Category Distribution
        const categoryStats = await FoodItem.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Populate category names
        const populatedCategoryStats = await Promise.all(
            categoryStats.map(async (stat) => {
                const category = await Category.findById(stat._id);
                return {
                    name: category ? category.name : 'Uncategorized',
                    value: stat.count
                };
            })
        );

        // 2. Stock Level Distribution
        const stockStats = await FoodItem.aggregate([
            {
                $bucket: {
                    groupBy: '$stockQuantity',
                    boundaries: [0, 11, 51, 101, 501],
                    default: '500+',
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        const stockLabels = {
            0: 'Out of Stock',
            11: 'Low Stock (1-10)',
            51: 'Medium (11-50)',
            101: 'High (51-100)',
            501: 'In Stock (101-500)',
            '500+': 'Overstock (500+)'
        };

        const formattedStockStats = stockStats.map(stat => ({
            name: stockLabels[stat._id] || stat._id,
            value: stat.count
        }));

        // 3. Low Stock Items (top 5 most critical)
        const lowStockItems = await FoodItem.find({
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
        })
            .populate('category')
            .sort({ stockQuantity: 1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                categoryDistribution: populatedCategoryStats,
                stockDistribution: formattedStockStats,
                criticalItems: lowStockItems
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Data for CSV export
// @route   GET /api/analytics/report
// @access  Private
exports.getAnalyticsReport = async (req, res) => {
    try {
        const items = await FoodItem.find().populate('category');

        // Flatten data for CSV
        const reportData = items.map(item => ({
            'Item Name': item.name,
            'Category': item.category ? item.category.name : 'N/A',
            'Stock Quantity': item.stockQuantity,
            'Threshold': item.lowStockThreshold,
            'Price': item.price,
            'Status': item.stockQuantity === 0 ? 'Out of Stock' : (item.stockQuantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'),
            'Visibility': item.isMenuVisible ? 'Visible' : 'Hidden',
            'Availability': item.isAvailable ? 'Available' : 'Unavailable'
        }));

        res.json({ success: true, data: reportData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
