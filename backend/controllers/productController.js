// backend/controllers/productController.js
const Product = require('../models/Product');
const { OUT_OF_STOCK_QUERY } = require('../helpers/preorder');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async(req, res) => {
    try {
        const {
            page = 1,
                limit = 12,
                category = '',
                subCategory = '',
                brand = '',
                minPrice = 0,
                maxPrice = 999999,
                search = '',
                sortBy = 'createdAt',
                order = 'desc',
                isFeatured,
                isNewArrival,
                isBestSeller,
                isHotDeals,
                onSale, // ✅ NEW: Added sale filter
                preorder,
        } = req.query;

        // Build query - only show active products
        const query = { isActive: true };

        // ✅ CASE-INSENSITIVE Category filter
        if (category) {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        // ✅ CASE-INSENSITIVE SubCategory filter
        if (subCategory) {
            query.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
        }

        // ✅ CASE-INSENSITIVE Brand filter (comma-separated list matches any)
        if (brand) {
            const brands = String(brand)
                .split(',')
                .map((b) => b.trim())
                .filter(Boolean)
                .map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            if (brands.length > 0) {
                query.brand = { $regex: new RegExp(`^\\s*(${brands.join('|')})\\s*$`, 'i') };
            }
        }

        // Price range filter
        // ✅ FIXED: Sale and Price filtering - matches checkout logic
        if (onSale === 'true') {
            // Products must have salePrice that exists, is not null, and is LESS THAN price
            query.salePrice = {
                $exists: true,
                $ne: null,
                $gt: 0 // Must be greater than 0
            };
            // CRITICAL: salePrice must be less than regular price (same as checkout logic)
            query.$expr = { $lt: ['$salePrice', '$price'] };

            // Apply price range to salePrice if user modified it
            if (Number(minPrice) > 0 || Number(maxPrice) < 999999) {
                // Build new salePrice condition combining all requirements
                const salePriceConditions = {
                    $exists: true,
                    $ne: null,
                    $gt: 0
                };

                if (Number(minPrice) > 0) {
                    salePriceConditions.$gte = Number(minPrice);
                }
                if (Number(maxPrice) < 999999) {
                    salePriceConditions.$lte = Number(maxPrice);
                }

                query.salePrice = salePriceConditions;
            }
        } else {
            // Regular price filtering - only apply if user changed from defaults
            if (Number(minPrice) > 0 || Number(maxPrice) < 999999) {
                const priceConditions = {};

                if (Number(minPrice) > 0) {
                    priceConditions.$gte = Number(minPrice);
                }
                if (Number(maxPrice) < 999999) {
                    priceConditions.$lte = Number(maxPrice);
                }

                query.price = priceConditions;
            }
        }



        // Search filter (already case-insensitive)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        // Feature flags
        if (isFeatured === 'true') {
            query.isFeatured = true;
        }
        if (isNewArrival === 'true') {
            query.isNewArrival = true;
        }
        if (isBestSeller === 'true') {
            query.isBestSeller = true;
        }
        if (isHotDeals === 'true') {
            query.isHotDeals = true;
        }
        // Pre-order products that are currently out of stock
        if (preorder === 'true') {
            query.isPreorderEnabled = true;
            query.$and = [...(query.$and || []), OUT_OF_STOCK_QUERY];
        }


        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        // Log query for debugging
        console.log('🔍 Product Query:', JSON.stringify(query, null, 2));
        console.log('📊 Sort:', sortOptions);
        console.log('📄 Pagination:', { page, limit });

        // Execute query with pagination
        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .select('-__v');

        // Get total count
        const totalProducts = await Product.countDocuments(query);

        console.log('✅ Found products:', products.length);

        // CONSISTENT RESPONSE STRUCTURE
        res.json({
            success: true,
            products,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalProducts / Number(limit)),
                totalProducts,
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error('❌ Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message,
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async(req, res) => {
    try {
        const { limit = 8 } = req.query;

        const products = await Product.find({
                isFeatured: true,
                isActive: true,
            })
            .sort({ rating: -1, sales: -1 })
            .limit(Number(limit))
            .select('-__v');

        res.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
        });
    }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async(req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            isActive: true,
        }).select('-__v');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Increment views (skipped for server-side lookups such as page titles/SEO)
        if (req.query.trackView !== 'false') {
            product.views += 1;
            await product.save();
        }

        res.json({
            success: true,
            product,
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async(req, res) => {
    try {
        const { limit = 4 } = req.query;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // ✅ CASE-INSENSITIVE related products
        const relatedProducts = await Product.find({
                _id: { $ne: product._id },
                category: { $regex: new RegExp(`^${product.category}$`, 'i') },
                isActive: true,
            })
            .sort({ rating: -1, sales: -1 })
            .limit(Number(limit))
            .select('-__v');

        res.json({
            success: true,
            products: relatedProducts,
        });
    } catch (error) {
        console.error('Get related products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch related products',
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async(req, res) => {
    try {
        const { page = 1, limit = 12, sortBy = 'createdAt', order = 'desc' } = req.query;
        const category = req.params.category;

        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        // ✅ CASE-INSENSITIVE category matching
        const products = await Product.find({
                category: { $regex: new RegExp(`^${category}$`, 'i') },
                isActive: true,
            })
            .sort(sortOptions)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .select('-__v');

        const totalProducts = await Product.countDocuments({
            category: { $regex: new RegExp(`^${category}$`, 'i') },
            isActive: true,
        });

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalProducts / Number(limit)),
                totalProducts,
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async(req, res) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }

        const products = await Product.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { brand: { $regex: q, $options: 'i' } },
                    { tags: { $regex: q, $options: 'i' } },
                ],
                isActive: true,
            })
            .sort({ rating: -1, sales: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .select('-__v');

        const totalProducts = await Product.countDocuments({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } },
            ],
            isActive: true,
        });

        res.json({
            success: true,
            products,
            query: q,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalProducts / Number(limit)),
                totalProducts,
                limit: Number(limit),
            },
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search products',
        });
    }
};

// @desc    Get all categories
// @route   GET /api/products/categories/list
// @access  Public
exports.getAllCategories = async(req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });

        const categoriesWithCount = await Promise.all(
            categories.map(async(category) => {
                const count = await Product.countDocuments({
                    category,
                    isActive: true,
                });
                return { name: category, count };
            })
        );

        res.json({
            success: true,
            categories: categoriesWithCount.sort((a, b) => b.count - a.count),
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
        });
    }
};

// @desc    Get best sellers
// @route   GET /api/products/bestsellers
// @access  Public
exports.getBestSellers = async(req, res) => {
    try {
        const { limit = 10 } = req.query;

        const products = await Product.find({
                isBestSeller: true,
                isActive: true,
            })
            .sort({ sales: -1, rating: -1 })
            .limit(Number(limit))
            .select('-__v');

        res.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error('Get best sellers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch best sellers',
        });
    }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async(req, res) => {
    try {
        const { limit = 10 } = req.query;

        const products = await Product.find({
                isNewArrival: true,
                isActive: true,
            })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .select('-__v');

        res.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error('Get new arrivals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch new arrivals',
        });
    }
};

// @desc    Get hot deals products
// @route   GET /api/products/hot-deals
// @access  Public
exports.getHotDeals = async(req, res) => {
    try {
        const { limit = 10 } = req.query;

        const products = await Product.find({
                isHotDeals: true,
                isActive: true,
            })
            .sort({ discountPercentage: -1, createdAt: -1 })
            .limit(Number(limit))
            .select('-__v');

        res.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error('Get hot deals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hot deals',
        });
    }
};

// @desc    Get products on sale
// @route   GET /api/products/on-sale
// @access  Public
exports.getProductsOnSale = async(req, res) => {
    try {
        const { limit = 10 } = req.query;

        const products = await Product.find({
                salePrice: { $exists: true, $ne: null },
                $expr: { $lt: ['$salePrice', '$price'] },
                isActive: true,
            })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .select('-__v');

        res.json({
            success: true,
            products,
        });
    } catch (error) {
        console.error('Get products on sale error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products on sale',
        });
    }
};