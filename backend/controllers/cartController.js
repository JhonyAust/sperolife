const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/cart/:userId
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color } = req.body;

    console.log("📦 Add to cart request:", { userId, productId, quantity, size, color });

    // Validate input
    if (!userId || !productId || !quantity || !size) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      console.error("❌ Product not found:", productId);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log("✅ Product found:", product.name, "| hasSizeVariants:", product.hasSizeVariants);

    // 🔥 Check size stock and price based on product structure
    let sizeOption;
    let itemPrice;
    let itemSalePrice = null;
    
    if (product.hasSizeVariants && product.sizeVariants && product.sizeVariants.length > 0) {
      // Product has size variants
      sizeOption = product.sizeVariants.find(s => s.size === size);
      console.log("📏 Looking for size in sizeVariants:", size, "| Found:", !!sizeOption);
      
      if (sizeOption) {
        // Use variant-specific pricing if available, otherwise fall back to product pricing
        itemPrice = sizeOption.price || product.price;
        itemSalePrice = sizeOption.salePrice || product.salePrice || null;
      }
    } else if (size === 'One Size' || !product.hasSizeVariants) {
      // Single size product
      sizeOption = { size: size, stock: product.stock || 0 };
      itemPrice = product.price;
      itemSalePrice = product.salePrice || null;
      console.log("📏 Using single size stock:", sizeOption.stock);
    }

    if (!sizeOption) {
      console.error("❌ Size not found:", size, "| Available sizes:", 
        product.sizeVariants?.map(s => s.size).join(', ') || 'One Size');
      return res.status(400).json({
        success: false,
        message: `Size ${size} not available for this product`
      });
    }

    if (sizeOption.stock < quantity) {
      console.error("❌ Insufficient stock:", { available: sizeOption.stock, requested: quantity });
      return res.status(400).json({
        success: false,
        message: `Only ${sizeOption.stock} items available in stock`
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log("🆕 Creating new cart for user:", userId);
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Check if item already exists in cart (same product, size, and color)
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.product.toString() === productId &&
        item.size === size &&
        (item.color === color || (!item.color && !color))
    );

    console.log("🔍 Existing item index:", existingItemIndex);

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      console.log("➕ Updating quantity:", { 
        old: cart.items[existingItemIndex].quantity, 
        new: newQuantity 
      });
      
      if (sizeOption.stock < newQuantity) {
        console.error("❌ Insufficient stock for update:", { 
          available: sizeOption.stock, 
          requested: newQuantity 
        });
        return res.status(400).json({
          success: false,
          message: `Only ${sizeOption.stock} items available. You already have ${cart.items[existingItemIndex].quantity} in your cart.`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].stock = sizeOption.stock;
      // ✅ Update pricing in case it changed
      cart.items[existingItemIndex].price = itemPrice;
      cart.items[existingItemIndex].salePrice = itemSalePrice;
    } else {
      // Add new item to cart
      console.log("🆕 Adding new item to cart");
      
      cart.items.push({
        product: productId,
        name: product.name,
        price: itemPrice,
        salePrice: itemSalePrice, // ✅ Store salePrice
        image: product.images[0],
        size,
        color: color || '',
        quantity,
        stock: sizeOption.stock
      });
    }

    await cart.save();
    console.log("💾 Cart saved successfully");
    
    await cart.populate('items.product');
    console.log("✅ Cart populated with product details");

    res.json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('💥 Add to cart error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let sizeOption;
    let itemPrice;
    let itemSalePrice = null;
    
    if (product.hasSizeVariants && product.sizeVariants) {
      sizeOption = product.sizeVariants.find(s => s.size === item.size);
      if (sizeOption) {
        itemPrice = sizeOption.price || product.price;
        itemSalePrice = sizeOption.salePrice || product.salePrice || null;
      }
    } else {
      sizeOption = { stock: product.stock };
      itemPrice = product.price;
      itemSalePrice = product.salePrice || null;
    }
    
    if (sizeOption.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeOption.stock} items available in stock`
      });
    }

    item.quantity = quantity;
    item.stock = sizeOption.stock;
    // ✅ Update pricing
    item.price = itemPrice;
    item.salePrice = itemSalePrice;
    
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    await cart.save();
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item'
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/:userId/clear
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// @desc    Merge guest cart with user cart
// @route   POST /api/cart/merge
// @access  Private
exports.mergeCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    console.log("🔄 Merging cart for user:", userId, "| Items:", items.length);

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid items data'
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Merge items
    for (const guestItem of items) {
      // Find existing item with same product, size, and color
      const existingIndex = cart.items.findIndex(
        item =>
          item.product.toString() === guestItem.product &&
          item.size === guestItem.size &&
          (item.color === guestItem.color || (!item.color && !guestItem.color))
      );

      if (existingIndex > -1) {
        // Update quantity
        cart.items[existingIndex].quantity += guestItem.quantity;
        console.log("➕ Updated existing item:", guestItem.name);
      } else {
        // Add new item (remove _id from guest item)
        const { _id, ...itemWithoutId } = guestItem;
        cart.items.push(itemWithoutId);
        console.log("🆕 Added new item:", guestItem.name);
      }
    }

    await cart.save();
    await cart.populate('items.product');

    console.log("✅ Cart merge completed. Total items:", cart.items.length);

    res.json({
      success: true,
      message: 'Cart merged successfully',
      cart
    });
  } catch (error) {
    console.error('💥 Merge cart error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to merge cart',
      error: error.message
    });
  }
};