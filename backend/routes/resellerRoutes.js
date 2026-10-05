// routes/resellerRoutes.js

const express = require('express');
const router = express.Router();
const {
    getResellerProducts,
    getResellerProductById,
    createResellerOrder,
    getResellerOrders,
    getResellerOrderById,
    cancelResellerOrder,
} = require('../controllers/resellerController');

const { protect, reseller } = require('../middleware/auth');

// Protect all routes - Reseller only
router.use(protect);
router.use(reseller);

// Products available for reselling
router.get('/products', getResellerProducts);
router.get('/products/:id', getResellerProductById);

// Reseller orders
router.post('/orders', createResellerOrder);
router.get('/orders', getResellerOrders);
router.get('/orders/:id', getResellerOrderById);
router.put('/orders/:id/cancel', cancelResellerOrder);

module.exports = router;
