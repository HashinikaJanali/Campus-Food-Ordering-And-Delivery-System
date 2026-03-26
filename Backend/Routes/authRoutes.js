const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const { protect } = require('../middleware/auth');

// Register admin
router.post('/register', authController.registerAdmin);

// Login admin
router.post('/login', authController.loginAdmin);

// Get current admin
router.get('/me', protect, authController.getMe);

// Update current admin username/password
router.put('/credentials', protect, authController.updateAdminCredentials);

module.exports = router;
