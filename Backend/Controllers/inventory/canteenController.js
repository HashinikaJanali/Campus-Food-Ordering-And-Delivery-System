const Canteen = require('../../Model/inventory/Canteen');

// Get all canteens
exports.getCanteens = async (req, res) => {
    try {
        const canteens = await Canteen.find({ isActive: true }).sort('name');
        res.json({ success: true, count: canteens.length, data: canteens });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all canteens
exports.getAdminCanteens = async (req, res) => {
    try {
        const canteens = await Canteen.find().sort('name');
        res.json({ success: true, count: canteens.length, data: canteens });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create new canteen
exports.createCanteen = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Canteen name is required' });
        }
        if (name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Canteen name must be at least 2 characters' });
        }
        if (name.trim().length > 100) {
            return res.status(400).json({ success: false, message: 'Canteen name cannot exceed 100 characters' });
        }
        const canteen = await Canteen.create({ ...req.body, name: name.trim() });
        res.status(201).json({ success: true, data: canteen });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'A canteen with this name already exists' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update canteen
exports.updateCanteen = async (req, res) => {
    try {
        const { name } = req.body;
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ success: false, message: 'Canteen name is required' });
            }
            if (name.trim().length < 2) {
                return res.status(400).json({ success: false, message: 'Canteen name must be at least 2 characters' });
            }
            if (name.trim().length > 100) {
                return res.status(400).json({ success: false, message: 'Canteen name cannot exceed 100 characters' });
            }
            req.body.name = name.trim();
        }
        const canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });
        if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
        res.json({ success: true, data: canteen });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'A canteen with this name already exists' });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete canteen
exports.deleteCanteen = async (req, res) => {
    try {
        const canteen = await Canteen.findByIdAndDelete(req.params.id);
        if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
        res.json({ success: true, message: 'Canteen deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
