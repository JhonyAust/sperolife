// backend/controllers/adminProductController.js
const Product = require('../models/Product');
const {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    deleteMultipleImages,
    extractPublicId,
} = require('../helpers/cloudinary');

// Reseller price: empty/null clears it, otherwise must be a positive number
const parseResellerPrice = (value) =>
    value === undefined || value === null || value === '' ? null : Number(value);

// Returns an error message, or null when the reseller fields are valid.
// `existing` is the current product on update (null on create).
const validateResellerFields = (isResellerAvailable, resellerPrice, existing) => {
    if (isResellerAvailable !== undefined && typeof isResellerAvailable !== 'boolean') {
        return 'isResellerAvailable must be true or false';
    }
    const price = resellerPrice !== undefined ? parseResellerPrice(resellerPrice) : existing?.resellerPrice ?? null;
    if (price !== null && (!Number.isFinite(price) || price <= 0)) {
        return 'Reseller price must be a positive number';
    }
    const enabled = isResellerAvailable !== undefined ? isResellerAvailable : existing?.isResellerAvailable;
    if (enabled && price === null) {
        return 'Set a reseller price before making the product available to resellers';
    }
    return null;
};

// @desc    Upload product image
// @route   POST /api/admin/products/upload-image
// @access  Private/Admin
exports.uploadProductImage = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        // Upload to Cloudinary
        const result = await uploadImageToCloudinary(
            req.file.buffer,
            'sperolife/products', {
                width: 1000,
                height: 1000,
                crop: 'limit',
                quality: 'auto:best',
            }
        );

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            result: {
                url: result.secure_url,
                public_id: result.public_id,
                secure_url: result.secure_url,
            },
        });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message,
        });
    }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async(req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            price,
            salePrice,
            category,
            subCategory,
            images,
            stock,
            tags,
            brand,
            features,
            hasSizeVariants,
            sizeVariants,
            isFeatured,
            isNewArrival,
            isBestSeller,
            isHotDeals,
            weight,
            metaTitle,
            metaDescription,
            sku,
            youtubeLink,
            isResellerAvailable,
            resellerPrice,
        } = req.body;

        // Validation
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (name, description, price, category)',
            });
        }

        const resellerError = validateResellerFields(isResellerAvailable, resellerPrice, null);
        if (resellerError) {
            return res.status(400).json({ success: false, message: resellerError });
        }

        // Validate size variants if enabled
        if (hasSizeVariants) {
            if (!sizeVariants || sizeVariants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide at least one size variant',
                });
            }
        }

        // Generate slug
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug exists
        const existingProduct = await Product.findOne({ slug });
        let finalSlug = slug;

        if (existingProduct) {
            // Add random number to make it unique
            finalSlug = `${slug}-${Date.now().toString().slice(-6)}`;
        }

        // Create product - SKU will be auto-generated in pre-save hook
        const product = await Product.create({
            name,
            slug: finalSlug,
            description,
            shortDescription,
            price: parseFloat(price),
            salePrice: salePrice ? parseFloat(salePrice) : null,
            category,
            subCategory,
            images: images || [],
            stock: hasSizeVariants ? 0 : parseInt(stock) || 0,
            tags: tags || [],
            brand: brand || '',
            features: features || [],
            hasSizeVariants: hasSizeVariants || false,
            sizeVariants: sizeVariants || [],
            isActive: true,
            isFeatured: isFeatured || false,
            isNewArrival: isNewArrival || false,
            isBestSeller: isBestSeller || false,
            isHotDeals: isHotDeals || false,
            weight: weight ? parseFloat(weight) : undefined,
            metaTitle,
            metaDescription,
            rating: 0,
            reviewCount: 0,
            sku: !hasSizeVariants && sku ? sku : undefined,
            youtubeLink: youtubeLink || undefined,
            isResellerAvailable: isResellerAvailable === true,
            resellerPrice: parseResellerPrice(resellerPrice),
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message,
        });
    }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAllProducts = async(req, res) => {
    try {
        const {
            page = 1,
                limit = 12,
                search = '',
                category = '',
                isActive = '',
                sortBy = 'createdAt',
                order = 'desc',
        } = req.query;

        // Build query
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (isActive !== '') {
            query.isActive = isActive === 'true';
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        // Execute query with pagination
        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count
        const totalProducts = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
};

// @desc    Get product statistics
// @route   GET /api/admin/products/stats
// @access  Private/Admin
exports.getProductStats = async(req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ isActive: true });
        const inactiveProducts = await Product.countDocuments({ isActive: false });

        // Out of stock - check both regular and size variants
        const outOfStock = await Product.countDocuments({
            $or: [
                { hasSizeVariants: false, stock: 0 },
                {
                    hasSizeVariants: true,
                    $expr: {
                        $eq: [
                            { $sum: '$sizeVariants.stock' },
                            0
                        ]
                    }
                }
            ]
        });

        // Low stock - check both regular and size variants
        const lowStock = await Product.countDocuments({
            $or: [
                { hasSizeVariants: false, stock: { $gt: 0, $lte: 10 } },
                {
                    hasSizeVariants: true,
                    $expr: {
                        $and: [
                            { $gt: [{ $sum: '$sizeVariants.stock' }, 0] },
                            { $lte: [{ $sum: '$sizeVariants.stock' }, 10] }
                        ]
                    }
                }
            ]
        });

        // Category breakdown
        const categoryStats = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Calculate average price
        const priceStats = await Product.aggregate([{
            $group: {
                _id: null,
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        }, ]);

        // Total inventory value (simplified - uses price * stock)
        const inventoryValue = await Product.aggregate([{
                $project: {
                    value: {
                        $cond: {
                            if: '$hasSizeVariants',
                            then: { $multiply: ['$price', { $sum: '$sizeVariants.stock' }] },
                            else: { $multiply: ['$price', '$stock'] }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$value' },
                },
            },
        ]);

        res.json({
            success: true,
            data: {
                totalProducts,
                activeProducts,
                inactiveProducts,
                outOfStock,
                lowStock,
                categories: categoryStats.map((cat) => ({
                    name: cat._id,
                    count: cat.count,
                })),
                pricing: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 },
                inventoryValue: inventoryValue[0] ?.totalValue || 0,
            },
        });
    } catch (error) {
        console.error('Get product stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product statistics',
            error: error.message,
        });
    }
};

// @desc    Get single product
// @route   GET /api/admin/products/:id
// @access  Private/Admin
exports.getProductById = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
    }
};

// @desc    Get product by SKU
// @route   GET /api/admin/products/sku/:sku
// @access  Private/Admin
exports.getProductBySKU = async(req, res) => {
    try {
        const product = await Product.findBySKU(req.params.sku);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error('Get product by SKU error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
    }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const {
            name,
            description,
            shortDescription,
            price,
            salePrice,
            category,
            subCategory,
            images,
            stock,
            isActive,
            tags,
            brand,
            features,
            hasSizeVariants,
            sizeVariants,
            isFeatured,
            isNewArrival,
            isBestSeller,
            isHotDeals,
            weight,
            metaTitle,
            metaDescription,
            sku,
            youtubeLink,
            isResellerAvailable,
            resellerPrice,
        } = req.body;

        const resellerError = validateResellerFields(isResellerAvailable, resellerPrice, product);
        if (resellerError) {
            return res.status(400).json({ success: false, message: resellerError });
        }

        // Update fields
        if (name) {
            product.name = name;
            // Update slug if name changes
            product.slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }
        if (description) product.description = description;
        if (shortDescription !== undefined) product.shortDescription = shortDescription;
        if (price) product.price = parseFloat(price);
        if (salePrice !== undefined) product.salePrice = salePrice ? parseFloat(salePrice) : null;
        if (category) product.category = category;
        if (subCategory !== undefined) product.subCategory = subCategory;
        if (images) product.images = images;
        if (stock !== undefined && !hasSizeVariants) product.stock = parseInt(stock);
        if (typeof isActive === 'boolean') product.isActive = isActive;
        if (tags) product.tags = tags;
        if (brand !== undefined) product.brand = brand;
        if (features) product.features = features;

        // Handle size variants update
        if (typeof hasSizeVariants === 'boolean') {
            product.hasSizeVariants = hasSizeVariants;
        }

        if (sizeVariants) {
            // Update size variants - new SKUs will be generated for variants without them
            product.sizeVariants = sizeVariants;
        }

        if (typeof isFeatured === 'boolean') product.isFeatured = isFeatured;
        if (typeof isNewArrival === 'boolean') product.isNewArrival = isNewArrival;
        if (typeof isBestSeller === 'boolean') product.isBestSeller = isBestSeller;
        if (typeof isHotDeals === 'boolean') product.isHotDeals = isHotDeals;
        if (weight !== undefined) product.weight = weight ? parseFloat(weight) : undefined;
        if (metaTitle !== undefined) product.metaTitle = metaTitle;
        if (metaDescription !== undefined) product.metaDescription = metaDescription;


        if (sku !== undefined && !hasSizeVariants) {
            product.sku = sku;
        }
        if (youtubeLink !== undefined) product.youtubeLink = youtubeLink;
        if (typeof isResellerAvailable === 'boolean') product.isResellerAvailable = isResellerAvailable;
        if (resellerPrice !== undefined) product.resellerPrice = parseResellerPrice(resellerPrice);

        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message,
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            const publicIds = product.images
                .map((url) => extractPublicId(url))
                .filter(Boolean);

            if (publicIds.length > 0) {
                await deleteMultipleImages(publicIds);
            }
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
        });
    }
};

// @desc    Toggle product status
// @route   PATCH /api/admin/products/:id/toggle-status
// @access  Private/Admin
exports.toggleProductStatus = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        product.isActive = !product.isActive;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
            data: product,
        });
    } catch (error) {
        console.error('Toggle product status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product status',
        });
    }
};

// @desc    Bulk delete products
// @route   POST /api/admin/products/bulk-delete
// @access  Private/Admin
exports.bulkDeleteProducts = async(req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide product IDs to delete',
            });
        }

        // Get products to delete their images
        const products = await Product.find({ _id: { $in: productIds } });

        // Collect all image public IDs
        const allPublicIds = [];
        products.forEach((product) => {
            if (product.images && product.images.length > 0) {
                const publicIds = product.images
                    .map((url) => extractPublicId(url))
                    .filter(Boolean);
                allPublicIds.push(...publicIds);
            }
        });

        // Delete images from Cloudinary
        if (allPublicIds.length > 0) {
            await deleteMultipleImages(allPublicIds);
        }

        // Delete products
        const result = await Product.deleteMany({ _id: { $in: productIds } });

        res.json({
            success: true,
            message: `${result.deletedCount} product(s) deleted successfully`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Bulk delete products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete products',
        });
    }
};

// @desc    Update product stock
// @route   PATCH /api/admin/products/:id/stock
// @access  Private/Admin
exports.updateProductStock = async(req, res) => {
    try {
        const { stock } = req.body;

        if (stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid stock quantity',
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (product.hasSizeVariants) {
            return res.status(400).json({
                success: false,
                message: 'This product uses size variants. Please update stock for individual sizes.',
            });
        }

        product.stock = parseInt(stock);
        await product.save();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: product,
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update stock',
        });
    }
};

// @desc    Update size variant stock
// @route   PATCH /api/admin/products/:id/size-variant-stock
// @access  Private/Admin
exports.updateSizeVariantStock = async(req, res) => {
    try {
        const { size, stock } = req.body;

        if (!size || stock === undefined || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide size and valid stock quantity',
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (!product.hasSizeVariants) {
            return res.status(400).json({
                success: false,
                message: 'This product does not use size variants',
            });
        }

        const variantIndex = product.sizeVariants.findIndex(v => v.size === size);
        if (variantIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Size variant not found',
            });
        }

        product.sizeVariants[variantIndex].stock = parseInt(stock);
        await product.save();

        res.json({
            success: true,
            message: 'Size variant stock updated successfully',
            data: product,
        });
    } catch (error) {
        console.error('Update size variant stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update size variant stock',
        });
    }
};