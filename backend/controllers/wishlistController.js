const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist/:userId
// @access  Private
exports.getWishlist = async(req, res) => {
    try {
        const { userId } = req.params;

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [] });
        }

        // ✅ Remove duplicates before returning
        const uniqueProductIds = [...new Set(wishlist.products.map(id => id.toString()))];
        
        // ✅ Update if duplicates were found
        if (uniqueProductIds.length !== wishlist.products.length) {
            wishlist.products = uniqueProductIds;
            await wishlist.save();
        }

        await wishlist.populate('products');

        res.json({
            success: true,
            products: wishlist.products
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist'
        });
    }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlistItem = async(req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [] });
        }

        // ✅ Convert to strings for comparison
        const productIds = wishlist.products.map(id => id.toString());
        const index = productIds.indexOf(productId);

        if (index > -1) {
            // Remove from wishlist
            wishlist.products.splice(index, 1);
        } else {
            // ✅ Check if it already exists (double-check)
            if (!productIds.includes(productId)) {
                wishlist.products.push(productId);
            }
        }

        // ✅ Extra safety: Remove any duplicates
        const uniqueIds = [...new Set(wishlist.products.map(id => id.toString()))];
        wishlist.products = uniqueIds;

        await wishlist.save();
        await wishlist.populate('products');

        res.json({
            success: true,
            message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
            products: wishlist.products
        });
    } catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update wishlist'
        });
    }
};

// @desc    Merge guest wishlist with user wishlist
// @route   POST /api/wishlist/merge
// @access  Private
exports.mergeWishlist = async(req, res) => {
    try {
        const { userId, productIds } = req.body;

        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product IDs'
            });
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, products: [] });
        }

        // ✅ Convert ALL to strings first
        const existingIds = wishlist.products.map(id => id.toString());
        const newIds = productIds.map(id => id.toString());
        
        // ✅ Combine and remove duplicates using Set
        const uniqueIds = [...new Set([...existingIds, ...newIds])];
        
        // ✅ Replace the entire products array with unique IDs
        wishlist.products = uniqueIds;

        await wishlist.save();
        await wishlist.populate('products');

        res.json({
            success: true,
            message: 'Wishlist merged successfully',
            products: wishlist.products
        });
    } catch (error) {
        console.error('Merge wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to merge wishlist'
        });
    }
};
// @desc    Clear user wishlist
// @route   DELETE /api/wishlist/:userId
// @access  Private
exports.clearWishlist = async(req, res) => {
    try {
        const { userId } = req.params;

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return res.json({
                success: true,
                products: []
            });
        }

        wishlist.products = [];
        await wishlist.save();

        res.json({
            success: true,
            message: 'Wishlist cleared successfully',
            products: []
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear wishlist'
        });
    }
};