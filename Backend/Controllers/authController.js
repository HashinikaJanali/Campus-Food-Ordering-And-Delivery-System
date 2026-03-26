const jwt = require('jsonwebtoken');
const Admin = require('../Model/Admin');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
        const { email, username, password } = req.body;
        const identifier = (username || email || '').trim();

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Username/email and password are required' });
        }

        const lowerIdentifier = identifier.toLowerCase();
        let admin = null;

        if (email) {
            admin = await Admin.findOne({ email: lowerIdentifier });
        } else {
            admin = await Admin.findOne({
                $or: [
                    { email: lowerIdentifier },
                    { name: { $regex: new RegExp(`^${escapeRegex(identifier)}$`, 'i') } },
                ],
            });
        }

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid username/email or password' });
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

// Update admin credentials
exports.updateAdminCredentials = async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        const hasUsername = typeof username === 'string' && username.trim().length > 0;
        const hasNewPassword = typeof newPassword === 'string' && newPassword.trim().length > 0;

        if (!hasUsername && !hasNewPassword) {
            return res.status(400).json({ success: false, message: 'Please provide a new username or password to update' });
        }

        if (hasUsername) {
            const nextUsername = username.trim();
            if (nextUsername.length < 2) {
                return res.status(400).json({ success: false, message: 'Username must be at least 2 characters' });
            }

            const existingAdmin = await Admin.findOne({
                _id: { $ne: admin._id },
                name: { $regex: new RegExp(`^${escapeRegex(nextUsername)}$`, 'i') },
            });

            if (existingAdmin) {
                return res.status(400).json({ success: false, message: 'Username is already in use' });
            }

            admin.name = nextUsername;
        }

        if (hasNewPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
            }

            const isCurrentPasswordCorrect = await admin.comparePassword(currentPassword);
            if (!isCurrentPasswordCorrect) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }

            const trimmedNewPassword = newPassword.trim();
            if (trimmedNewPassword.length < 6) {
                return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
            }

            const isSamePassword = await admin.comparePassword(trimmedNewPassword);
            if (isSamePassword) {
                return res.status(400).json({ success: false, message: 'New password must be different from current password' });
            }

            admin.password = trimmedNewPassword;
        }

        await admin.save();

        return res.json({
            success: true,
            message: 'Admin credentials updated successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        return res.status(500).json({ success: false, message: err.message });
    }
};
