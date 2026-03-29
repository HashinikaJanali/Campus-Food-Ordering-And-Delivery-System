const FoodItem = require('../../Model/inventory/FoodItem');
const StockAlert = require('../../Model/inventory/StockAlert');
const alertService = require('../../services/alertService');
const fs = require('fs');
const path = require('path');

// Helper: create stock alert (DEPRECATED - using centralized service)
// const createStockAlert = async (foodItem, alertType) => ...


// Create food item
exports.createFoodItem = async (req, res, next) => {
    try {
        const data = { ...req.body };

        // --- Request-level validation ---
        if (!data.name || !data.name.trim()) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Food item name is required' });
        }
        if (data.name.trim().length < 2) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        }
        if (data.name.trim().length > 100) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Name cannot exceed 100 characters' });
        }
        if (data.price === undefined || data.price === '' || data.price === null) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Price is required' });
        }
        if (isNaN(data.price) || Number(data.price) < 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Price must be a valid number (0 or greater)' });
        }
        if (!data.category) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please select a category' });
        }
        if (!data.canteen) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Please select a canteen' });
        }
        if (data.stockQuantity !== undefined && (isNaN(data.stockQuantity) || Number(data.stockQuantity) < 0)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative' });
        }
        if (data.lowStockThreshold !== undefined && (isNaN(data.lowStockThreshold) || Number(data.lowStockThreshold) < 0)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Low stock threshold cannot be negative' });
        }
        if (data.preparationTime !== undefined && (isNaN(data.preparationTime) || Number(data.preparationTime) < 1)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Preparation time must be at least 1 minute' });
        }

        data.name = data.name.trim();
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
        await FoodItem.populate(foodItem, ['category', 'canteen']);

        // Check stock after creation
        await alertService.checkStockAlerts(foodItem, undefined, req.app.get('io'));

        res.status(201).json({ success: true, message: 'Food item created successfully', data: foodItem });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all food items
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

// Public menu (students view)
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

// Dashboard stats
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

// Get single item
exports.getFoodItemById = async (req, res) => {
    try {
        const item = await FoodItem.findById(req.params.id).populate(['category', 'canteen']);
        if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });
        res.json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update food item
exports.updateFoodItem = async (req, res) => {
    try {
        const existing = await FoodItem.findById(req.params.id);
        if (!existing) return res.status(404).json({ success: false, message: 'Food item not found' });

        const prevStock = existing.stockQuantity;
        const data = { ...req.body };

        // --- Request-level validation ---
        if (data.name !== undefined) {
            if (!data.name.trim()) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: 'Food item name is required' });
            }
            if (data.name.trim().length < 2) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
            }
            if (data.name.trim().length > 100) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: 'Name cannot exceed 100 characters' });
            }
            data.name = data.name.trim();
        }
        if (data.price !== undefined && (isNaN(data.price) || Number(data.price) < 0)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Price must be a valid number (0 or greater)' });
        }
        if (data.stockQuantity !== undefined && (isNaN(data.stockQuantity) || Number(data.stockQuantity) < 0)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Stock quantity cannot be negative' });
        }
        if (data.lowStockThreshold !== undefined && (isNaN(data.lowStockThreshold) || Number(data.lowStockThreshold) < 0)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Low stock threshold cannot be negative' });
        }
        if (data.preparationTime !== undefined && (isNaN(data.preparationTime) || Number(data.preparationTime) < 1)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Preparation time must be at least 1 minute' });
        }

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

        const updated = await FoodItem.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after', runValidators: true }).populate(['category', 'canteen']);

        // Use centralized alert service
        await alertService.checkStockAlerts(updated, prevStock, req.app.get('io'));

        res.json({ success: true, message: 'Food item updated successfully', data: updated });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// Toggle menu visibility
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

// Toggle availability
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

// Delete food item
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
