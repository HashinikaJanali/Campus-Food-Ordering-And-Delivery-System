const Category = require('../../Model/inventory/Category');
const FoodItem = require('../../Model/inventory/FoodItem');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { name, displayOrder } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required' });
        }
        if (name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters' });
        }
        if (name.trim().length > 50) {
            return res.status(400).json({ success: false, message: 'Category name cannot exceed 50 characters' });
        }
        if (displayOrder !== undefined && (isNaN(displayOrder) || Number(displayOrder) < 0)) {
            return res.status(400).json({ success: false, message: 'Display order must be 0 or greater' });
        }
        const category = await Category.create({ ...req.body, name: name.trim() });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'A category with this name already exists' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name, displayOrder } = req.body;
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ success: false, message: 'Category name is required' });
            }
            if (name.trim().length < 2) {
                return res.status(400).json({ success: false, message: 'Category name must be at least 2 characters' });
            }
            if (name.trim().length > 50) {
                return res.status(400).json({ success: false, message: 'Category name cannot exceed 50 characters' });
            }
            req.body.name = name.trim();
        }
        if (displayOrder !== undefined && (isNaN(displayOrder) || Number(displayOrder) < 0)) {
            return res.status(400).json({ success: false, message: 'Display order must be 0 or greater' });
        }
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'A category with this name already exists' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const itemCount = await FoodItem.countDocuments({ category: req.params.id });
        if (itemCount > 0) {
            return res.status(400).json({ success: false, message: `Cannot delete: ${itemCount} food items use this category` });
        }
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
