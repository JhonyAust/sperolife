// backend/routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const {
    getActiveBanners,
    getBannerById,
} = require('../controllers/bannerController');

// Public routes
router.get('/', getActiveBanners);
router.get('/:id', getBannerById);

module.exports = router;