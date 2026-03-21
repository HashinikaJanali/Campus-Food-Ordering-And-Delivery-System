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
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (err) {
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
