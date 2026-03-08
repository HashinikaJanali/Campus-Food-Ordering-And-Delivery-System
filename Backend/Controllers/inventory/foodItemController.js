const FoodItem = require('../../models/inventory/FoodItem');
const StockAlert = require('../../models/inventory/StockAlert');
const fs = require('fs');
const path = require('path');

// Helper: create stock alert
const createStockAlert = async (foodItem, alertType) => {
    let message = '';
    if (alertType === 'out_of_stock') {
        message = `"${foodItem.name}" is now OUT OF STOCK (0 remaining).`;
    } else if (alertType === 'low_stock') {
        message = `"${foodItem.name}" is running LOW on stock. Only ${foodItem.stockQuantity} left (threshold: ${foodItem.lowStockThreshold}).`;
    } else if (alertType === 'restocked') {
        message = `"${foodItem.name}" has been restocked. Current stock: ${foodItem.stockQuantity}.`;
    }

    // Check for existing unresolved alert of same type
    const existing = await StockAlert.findOne({
        foodItem: foodItem._id,
        alertType,
        isResolved: false
    });

    if (!existing) {
        await StockAlert.create({
            foodItem: foodItem._id,
            alertType,
            message,
            currentStock: foodItem.stockQuantity,
            threshold: foodItem.lowStockThreshold
        });
    }
};

// @desc    Create food item
// @route   POST /api/food-items
// @access  Private
exports.createFoodItem = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = `/uploads/food-images/${req.file.filename}`;
        }

        // Parse JSON fields if sent as strings
        if (data.tags && typeof data.tags === 'string') {
            try { data.tags = JSON.parse(data.tags); } catch { data.tags = data.tags.split(',').map(t => t.trim()); }
        }
        if (data.allergens && typeof data.allergens === 'string') {
            try { data.allergens = JSON.parse(data.allergens); } catch { data.allergens = []; }
        }
        if (data.nutritionInfo && typeof data.nutritionInfo === 'string') {
            try { data.nutritionInfo = JSON.parse(data.nutritionInfo); } catch { data.nutritionInfo = {}; }
        }

        data.isVegetarian = data.isVegetarian === 'true' || data.isVegetarian === true;
        data.isVegan = data.isVegan === 'true' || data.isVegan === true;
        data.isMenuVisible = data.isMenuVisible === 'true' || data.isMenuVisible === true || data.isMenuVisible === undefined;

        const foodItem = await FoodItem.create(data);
        await foodItem.populate(['category', 'canteen']);

        // Check stock after creation
        if (foodItem.stockQuantity === 0) {
            await createStockAlert(foodItem, 'out_of_stock');
        } else if (foodItem.stockQuantity <= foodItem.lowStockThreshold) {
            await createStockAlert(foodItem, 'low_stock');
        }

        res.status(201).json({ success: true, message: 'Food item created successfully', data: foodItem });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all food items
// @route   GET /api/food-items
// @access  Public
exports.getFoodItems = async (req, res) => {
    try {
        const { category, search, status, menuVisible, page = 1, limit = 50 } = req.query;
        const filter = {};

        if (category && category !== 'all') filter.category = category;
        if (search) filter.$text = { $search: search };
        if (menuVisible === 'true') filter.isMenuVisible = true;
        if (menuVisible === 'false') filter.isMenuVisible = false;
        if (status === 'in_stock') filter.stockQuantity = { $gt: 10 };
        if (status === 'low_stock') filter.stockQuantity = { $gt: 0, $lte: 10 };
        if (status === 'out_of_stock') filter.stockQuantity = 0;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await FoodItem.countDocuments(filter);
        const items = await FoodItem.find(filter)
            .populate('category')
            .populate('canteen', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: items,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Public menu (students view)
// @route   GET /api/food-items/public
// @access  Public
exports.getPublicMenu = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isMenuVisible: true };
        if (category && category !== 'all') filter.category = category;

        const items = await FoodItem.find(filter)
            .populate('category')
            .populate('canteen', 'name')
            .sort({ category: 1, name: 1 });

        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Dashboard stats
// @route   GET /api/food-items/stats
// @access  Private
exports.getFoodItemStats = async (req, res) => {
    try {
        const total = await FoodItem.countDocuments();
        const inStock = await FoodItem.countDocuments({ stockQuantity: { $gt: 10 } });
        const lowStock = await FoodItem.countDocuments({ stockQuantity: { $gt: 0, $lte: 10 } });
        const outOfStock = await FoodItem.countDocuments({ stockQuantity: 0 });
        const visible = await FoodItem.countDocuments({ isMenuVisible: true });
        const hidden = await FoodItem.countDocuments({ isMenuVisible: false });

        const lowStockItems = await FoodItem.find({ stockQuantity: { $gt: 0, $lte: 10 } })
            .populate(['category', 'canteen'])
            .select('name stockQuantity lowStockThreshold image category canteen')
            .sort({ stockQuantity: 1 })
            .limit(5);

        const outOfStockItems = await FoodItem.find({ stockQuantity: 0 })
            .populate(['category', 'canteen'])
            .select('name stockQuantity image category canteen')
            .limit(5);

        res.json({
            success: true,
            data: { total, inStock, lowStock, outOfStock, visible, hidden, lowStockItems, outOfStockItems }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single item
// @route   GET /api/food-items/:id
// @access  Public
exports.getFoodItemById = async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id).populate(['category', 'canteen']);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update food item
// @route   PUT /api/food-items/:id
// @access  Private
exports.updateFoodItem = async (req, res) => {
    try {
        const existing = await FoodItem.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: 'Food item not found' });

        const prevStock = existing.stockQuantity;
        const data = { ...req.body };

        if (req.file) {
            // Remove old image
            if (existing.image) {
                const oldPath = path.join(__dirname, '..', '..', existing.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            data.image = `/uploads/food-images/${req.file.filename}`;
        }

        if (data.tags && typeof data.tags === 'string') {
            try { data.tags = JSON.parse(data.tags); } catch { data.tags = data.tags.split(',').map(t => t.trim()); }
        }
        if (data.allergens && typeof data.allergens === 'string') {
            try { data.allergens = JSON.parse(data.allergens); } catch { data.allergens = []; }
        }
        if (data.nutritionInfo && typeof data.nutritionInfo === 'string') {
            try { data.nutritionInfo = JSON.parse(data.nutritionInfo); } catch { delete data.nutritionInfo; }
        }
        if (data.isVegetarian !== undefined) data.isVegetarian = data.isVegetarian === 'true' || data.isVegetarian === true;
        if (data.isVegan !== undefined) data.isVegan = data.isVegan === 'true' || data.isVegan === true;
        if (data.isMenuVisible !== undefined) data.isMenuVisible = data.isMenuVisible === 'true' || data.isMenuVisible === true;

        const updated = await FoodItem.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate(['category', 'canteen']);

        // Stock change alerts
        const newStock = updated.stockQuantity;
        if (prevStock === 0 && newStock > 0) {
            await StockAlert.updateMany({ foodItem: updated._id, isResolved: false }, { isResolved: true });
            await createStockAlert(updated, 'restocked');
        } else if (newStock === 0 && prevStock > 0) {
            await StockAlert.updateMany({ foodItem: updated._id, alertType: 'low_stock', isResolved: false }, { isResolved: true });
            await createStockAlert(updated, 'out_of_stock');
        } else if (newStock > 0 && newStock <= updated.lowStockThreshold) {
            await createStockAlert(updated, 'low_stock');
        }

        res.json({ success: true, message: 'Food item updated successfully', data: updated });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Toggle menu visibility
// @route   PATCH /api/food-items/:id/toggle-menu
// @access  Private
exports.toggleMenuVisibility = async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });
        item.isMenuVisible = !item.isMenuVisible;
        await item.save();
        res.json({ success: true, message: `Item ${item.isMenuVisible ? 'shown on' : 'hidden from'} menu`, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Toggle availability
// @route   PATCH /api/food-items/:id/toggle-availability
// @access  Private
exports.toggleAvailability = async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });
        if (item.stockQuantity === 0) {
            return res.status(400).json({ success: false, message: 'Cannot make item available when stock is 0' });
        }
        item.isAvailable = !item.isAvailable;
        await item.save();
        res.json({ success: true, message: `Item marked as ${item.isAvailable ? 'available' : 'unavailable'}`, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete food item
// @route   DELETE /api/food-items/:id
// @access  Private
exports.deleteFoodItem = async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });

        // Remove image file
        if (item.image) {
            const imgPath = path.join(__dirname, '..', '..', item.image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        await FoodItem.findByIdAndDelete(req.params.id);
        await StockAlert.deleteMany({ foodItem: req.params.id });

        res.json({ success: true, message: 'Food item deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
