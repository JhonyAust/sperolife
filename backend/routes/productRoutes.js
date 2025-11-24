// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getFeaturedProducts,
    getProductBySlug,
    getRelatedProducts,
    getProductsByCategory,
    searchProducts,
    getAllCategories,
    getBestSellers,
    getNewArrivals,
    getProductsOnSale,
} = require('../controllers/productController');

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// Get all products with filters
router.get('/', getAllProducts);

// Get featured products
router.get('/featured', getFeaturedProducts);

// Get best sellers
router.get('/bestsellers', getBestSellers);

// Get new arrivals
router.get('/new-arrivals', getNewArrivals);

// Get products on sale
router.get('/on-sale', getProductsOnSale);

// Search products
router.get('/search', searchProducts);

// Get all categories
router.get('/categories/list', getAllCategories);

// Get products by category
router.get('/category/:category', getProductsByCategory);

router.get('/:slug', getProductBySlug);

// Get related products
router.get('/:id/related', getRelatedProducts);



module.exports = router;