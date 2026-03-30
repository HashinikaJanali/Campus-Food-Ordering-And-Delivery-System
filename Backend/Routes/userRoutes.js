const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserStatus,
  deleteUser
} = require('../Controllers/userController');
const { protectUser, protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (User)
router.get('/profile', protectUser, getUserProfile);
router.put('/profile', protectUser, updateUserProfile);

// Admin routes for user management
router.get('/', protect, getAllUsers);
router.patch('/:id/status', protect, updateUserStatus);
router.delete('/:id', protect, deleteUser);

module.exports = router;
