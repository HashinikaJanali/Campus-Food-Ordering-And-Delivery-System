const Canteen = require('../../models/inventory/Canteen');

// @desc    Get all canteens
// @route   GET /api/canteens
// @access  Public
exports.getCanteens = async (req, res) => {
    try {
        const canteens = await Canteen.find({ isActive: true }).sort('name');
        res.json({ success: true, count: canteens.length, data: canteens });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all canteens (Admin)
// @route   GET /api/canteens/admin
// @access  Private/Admin
exports.getAdminCanteens = async (req, res) => {
    try {
        const canteens = await Canteen.find().sort('name');
        res.json({ success: true, count: canteens.length, data: canteens });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create new canteen
// @route   POST /api/canteens
// @access  Private/Admin
exports.createCanteen = async (req, res) => {
    try {
        const canteen = await Canteen.create(req.body);
        res.status(201).json({ success: true, data: canteen });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update canteen
// @route   PATCH /api/canteens/:id
// @access  Private/Admin
exports.updateCanteen = async (req, res) => {
    try {
        const canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
        res.json({ success: true, data: canteen });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete canteen
// @route   DELETE /api/canteens/:id
// @access  Private/Admin
exports.deleteCanteen = async (req, res) => {
    try {
        const canteen = await Canteen.findByIdAndDelete(req.params.id);
        if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
        res.json({ success: true, message: 'Canteen deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
