// routes/adminOrderRoutes.js

const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    updateOrderNotes,
    getOrderStats,
    generateInvoice,
    bulkUpdateOrders,
    updatePaymentStatus
} = require('../controllers/adminOrderController');

const { protect, admin } = require('../middleware/auth');

// Protect all routes - Admin only
router.use(protect);
router.use(admin);

// Statistics
router.get('/stats', getOrderStats);

// Bulk operations
router.put('/bulk-update', bulkUpdateOrders);

// Get all orders with filters
router.get('/', getAllOrders);

// Get single order
router.get('/:id', getOrderById);

// Update order status
router.put('/:id/status', updateOrderStatus);

// Cancel order
router.put('/:id/cancel', cancelOrder);

// Update admin notes
router.put('/:id/notes', updateOrderNotes);

// Generate invoice
router.get('/:id/invoice', generateInvoice);

// Delete order
router.delete('/:id', deleteOrder);

router.put('/:id/payment-status', updatePaymentStatus);

module.exports = router;