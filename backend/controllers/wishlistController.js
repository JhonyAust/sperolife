const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist/:userId
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

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
exports.toggleWishlistItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if product exists
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

    const productIndex = wishlist.products.indexOf(productId);

    if (productIndex > -1) {
      // Remove from wishlist
      wishlist.products.splice(productIndex, 1);
    } else {
      // Add to wishlist
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate('products');

    res.json({
      success: true,
      message: productIndex > -1 ? 'Removed from wishlist' : 'Added to wishlist',
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
exports.mergeWishlist = async (req, res) => {
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

    // Merge unique products
    const uniqueProducts = [...new Set([...wishlist.products, ...productIds])];
    wishlist.products = uniqueProducts;

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
