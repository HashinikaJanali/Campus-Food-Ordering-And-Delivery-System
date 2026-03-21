const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const authMiddleware = require('../middleware/auth');

// Register admin
router.post('/register', authController.registerAdmin);

// Login admin
router.post('/login', authController.loginAdmin);

// Get current admin
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
