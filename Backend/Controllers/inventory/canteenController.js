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
        const canteen = await Canteen.create(req.body);
        res.status(201).json({ success: true, data: canteen });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Update canteen
exports.updateCanteen = async (req, res) => {
    try {
        const canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });
        if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
        res.json({ success: true, data: canteen });
    } catch (err) {
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
