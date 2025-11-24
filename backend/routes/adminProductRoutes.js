// backend/routes/adminProductRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../helpers/cloudinary');
const {
    uploadProductImage,
    createProduct,
    getAllProducts,
    getProductStats,
    getProductById,
    getProductBySKU,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    bulkDeleteProducts,
    updateProductStock,
    updateSizeVariantStock,
} = require('../controllers/adminProductController');

const { protect, admin } = require('../middleware/auth');

// Apply authentication and admin check to all routes
router.use(protect, admin);

// Image upload
router.post('/upload-image', upload.single('my_file'), uploadProductImage);

// Product statistics (must come before /:id route)
router.get('/stats', getProductStats);

// Get product by SKU (must come before /:id route)
router.get('/sku/:sku', getProductBySKU);

// Product CRUD
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Product status & stock management
router.patch('/:id/toggle-status', toggleProductStatus);
router.patch('/:id/stock', updateProductStock);
router.patch('/:id/size-variant-stock', updateSizeVariantStock);

// Bulk operations
router.post('/bulk-delete', bulkDeleteProducts);

module.exports = router;