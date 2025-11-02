// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserStats,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    bulkDeleteUsers,
    exportUsers,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth'); // Changed: added 'admin'

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(admin); // Changed: use 'admin' instead of 'authorize('admin')'

// User management routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.get('/users/export', exportUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.post('/users/bulk-delete', bulkDeleteUsers);

module.exports = router;