const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsersForAdmin,
  updateAccountStatusByAdmin,
  deleteAccountByAdmin
} = require('../Controllers/userController');
const { protectUser, protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin management routes
router.get('/', protect, getAllUsersForAdmin);
router.patch('/:id/status', protect, updateAccountStatusByAdmin);
router.delete('/:id', protect, deleteAccountByAdmin);

// Protected routes
router.get('/profile', protectUser, getUserProfile);
router.put('/profile', protectUser, updateUserProfile);

module.exports = router;
