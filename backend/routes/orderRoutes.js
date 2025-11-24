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

// Public routes
router.post('/', createOrder);

// User routes
router.get('/user/:userId', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes (add authentication middleware as needed)
router.get('/admin/all', getAllOrders);
router.get('/admin/stats', getOrderStats);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/notes', updateOrderNotes);
router.delete('/:id', deleteOrder);

module.exports = router;