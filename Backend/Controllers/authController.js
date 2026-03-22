const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @desc    Register admin (for initial setup)
// @route   POST /api/auth/register
// @access  Public (Initial setup only)
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const admin = await Admin.create({ name, email, password });
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const admin = await Admin.findOne({ email });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get current admin
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.json({ success: true, admin: req.admin });
};
