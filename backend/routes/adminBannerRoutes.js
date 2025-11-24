// backend/routes/adminBannerRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../helpers/cloudinary');
const {
    uploadBannerImage,
    createBanner,
    getAllBanners,
    getBannerStats,
    getBannerById,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners,
} = require('../controllers/adminBannerController');

const { protect, admin } = require('../middleware/auth');

// Apply authentication and admin check to all routes
router.use(protect, admin);

// Image upload
router.post('/upload-image', upload.single('my_file'), uploadBannerImage);

// Banner CRUD
router.post('/', createBanner);
router.get('/', getAllBanners);
router.get('/stats', getBannerStats);
router.get('/:id', getBannerById);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

// Banner operations
router.patch('/:id/toggle-status', toggleBannerStatus);
router.patch('/reorder', reorderBanners);

module.exports = router;