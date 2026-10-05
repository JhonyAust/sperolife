const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    updateOrderNotes,
    deleteOrder,
    getOrderStats
} = require('../controllers/orderController');
const { protect, admin, optionalAuth } = require('../middleware/auth');

// Public route (guest checkout allowed; the order is linked to the logged-in user, if any)
router.post('/', optionalAuth, createOrder);

// Admin routes
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/admin/stats', protect, admin, getOrderStats);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/notes', protect, admin, updateOrderNotes);
router.delete('/:id', protect, admin, deleteOrder);

// User routes (ownership is checked in the controller)
router.get('/user/:userId', protect, getUserOrders);
router.get('/:id', optionalAuth, getOrderById);

module.exports = router;
