const express = require('express');
const router = express.Router();
const {
    register,
    login,
    googleLogin,
    verifyToken,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/verify', protect, verifyToken);
router.post('/logout', protect, logout);
router.put('/users/:id', protect, updateProfile);
module.exports = router;