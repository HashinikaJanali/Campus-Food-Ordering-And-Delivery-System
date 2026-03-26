const jwt = require('jsonwebtoken');
const Admin = require('../Model/Admin');

// Register admin
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Full name is required' });
        }
        if (name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existing = await Admin.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const admin = await Admin.create({ name: name.trim(), email, password });
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (err) {
        // Extract Mongoose validation error messages
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// Login admin
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
        if (admin.active === false) {
            return res.status(403).json({ success: false, message: 'Admin account is inactive' });
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

// Get current admin
exports.getMe = async (req, res) => {
    res.json({ success: true, admin: req.admin });
};
