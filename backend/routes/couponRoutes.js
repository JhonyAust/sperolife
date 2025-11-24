const express = require('express');
const router = express.Router();
const {
    getAllCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateAndApplyCoupon,
    getCouponStats,
} = require('../controllers/couponController');

const { protect, admin } = require('../middleware/auth');

// ============================================
// Admin Routes (Protected)
// Base path: /api/coupon
// ============================================

// Stats must come BEFORE :id route to avoid conflict
router.get('/admin/stats', protect, admin, getCouponStats);

// CRUD Operations
router.get('/admin', protect, admin, getAllCoupons);
router.get('/admin/:id', protect, admin, getCoupon);
router.post('/admin', protect, admin, createCoupon);
router.patch('/admin/:id', protect, admin, updateCoupon);
router.delete('/admin/:id', protect, admin, deleteCoupon);
router.patch('/admin/:id/toggle-status', protect, admin, toggleCouponStatus);

// ============================================
// Public/Checkout Routes (No Auth Required)
// ============================================
router.post('/validate', validateAndApplyCoupon);

module.exports = router;