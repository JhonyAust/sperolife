const crypto = require('crypto');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { PREORDER_MAX_QUANTITY, getSizeStock, isPreorderable } = require('../helpers/preorder'); // ✅ Add Coupon import
const { broadcastNotification, broadcastUnreadCount } = require('../routes/notificationSSE');

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

const isAdmin = (user) => user?.role === 'admin';

// Owner, admin, or a guest holding the order's access token may view an order
const canViewOrder = (order, user, token) => {
  if (isAdmin(user)) return true;
  if (order.userId) {
    const ownerId = String(order.userId._id || order.userId);
    return Boolean(user) && ownerId === String(user._id);
  }
  if (!order.guestAccessTokenHash || typeof token !== 'string' || !token) return false;
  const expected = Buffer.from(order.guestAccessTokenHash, 'hex');
  const actual = Buffer.from(hashToken(token), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

// @desc    Create new order
// @route   POST /api/order
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const {
      cartItems,
      addressInfo,
      paymentMethod,
      shippingCharge,
      shippingType,
      totalAmount,
      couponCode,
      discountAmount
    } = req.body;

    // The order belongs to the authenticated user; a userId in the body is never trusted
    const userId = req.user?._id || null;

    console.log("📦 Creating order:", { userId, itemCount: cartItems?.length, couponCode });

    // Validation
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    if (!addressInfo || !addressInfo.name || !addressInfo.phone || !addressInfo.address) {
      return res.status(400).json({
        success: false,
        message: 'Address information is incomplete'
      });
    }

    // Validate stock for each item. The server decides which lines are pre-orders:
    // a line is a pre-order only if that size is out of stock and the product allows it.
    const preorderInfo = []; // per cartItems index: { isPreorder, preorderNote }
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.title} not found`
        });
      }

      const availableStock = getSizeStock(product, item.size);
      if (availableStock === null) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} not available for ${item.title}`
        });
      }

      if (availableStock >= item.quantity) {
        preorderInfo.push({ isPreorder: false, preorderNote: '' });
        continue;
      }

      if (isPreorderable(product, availableStock)) {
        if (item.quantity > PREORDER_MAX_QUANTITY) {
          return res.status(400).json({
            success: false,
            message: `You can pre-order up to ${PREORDER_MAX_QUANTITY} of ${item.title}`
          });
        }
        preorderInfo.push({ isPreorder: true, preorderNote: product.preorderNote || '' });
        continue;
      }

      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${item.title}. Only ${availableStock} available`
      });
    }

    // ✅ Validate coupon if provided (double-check on backend)
    let validatedCoupon = null;
    if (couponCode) {
      try {
        // Calculate subtotal using effective prices (salePrice if available, otherwise regular price)
        const subtotal = cartItems.reduce((sum, item) => {
          const effectivePrice = item.salePrice || item.price;
          return sum + (effectivePrice * item.quantity);
        }, 0);
        
        validatedCoupon = await Coupon.validateCoupon(
          couponCode,
          subtotal,
          userId,
          cartItems
        );
        console.log("✅ Coupon validated:", validatedCoupon.couponCode);
      } catch (couponError) {
        console.warn("⚠️ Coupon validation failed:", couponError.message);
        // Return error for strict validation
        return res.status(400).json({
          success: false,
          message: couponError.message || 'Invalid coupon code'
        });
      }
    }

    // Transform cartItems to match Order schema
    const transformedCartItems = cartItems.map((item, index) => ({
      product: item.productId, // This is the reference to Product model
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color || '',
      isPreorder: preorderInfo[index].isPreorder,
      preorderNote: preorderInfo[index].preorderNote
    }));

    console.log("🔄 Creating order with transformed items...");

    // Create order - orderNumber will be auto-generated by pre-save hook
    const order = new Order({
      userId: userId || null,
      cartItems: transformedCartItems,
      addressInfo,
      paymentMethod: paymentMethod || 'COD',
      shippingCharge: shippingCharge || 0,
      shippingType: shippingType || 'inside',
      totalAmount,
      couponCode: couponCode || null,
      discountAmount: discountAmount || 0,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      isPreorder: preorderInfo.some((p) => p.isPreorder)
    });

    // Guests get a one-time token so they can view their order confirmation
    let guestAccessToken = null;
    if (!userId) {
      guestAccessToken = crypto.randomBytes(24).toString('hex');
      order.guestAccessTokenHash = hashToken(guestAccessToken);
    }

    // Save order (this triggers the pre-save hook to generate orderNumber)
    await order.save();
    
    console.log("✅ Order saved with number:", order.orderNumber);

    // ✅ Increment coupon usage if coupon was used
    if (validatedCoupon) {
      try {
        await validatedCoupon.incrementUsage();
        console.log("✅ Coupon usage incremented:", validatedCoupon.couponCode, "- Used:", validatedCoupon.usedCount);
      } catch (couponUpdateError) {
        console.error("❌ Failed to increment coupon usage:", couponUpdateError.message);
        // Don't fail the order if coupon update fails
      }
    }

    // Update product stock (pre-order lines have no stock to take)
    for (const [index, item] of cartItems.entries()) {
      if (preorderInfo[index].isPreorder) continue;
      const product = await Product.findById(item.productId);
      
      if (!product) continue; // Skip if product not found
      
      if (product.hasSizeVariants && product.sizeVariants && product.sizeVariants.length > 0) {
        const sizeIndex = product.sizeVariants.findIndex(s => s.size === item.size);
        if (sizeIndex !== -1) {
          product.sizeVariants[sizeIndex].stock = Math.max(0, product.sizeVariants[sizeIndex].stock - item.quantity);
        }
      } else {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
      
      await product.save();
    }

    // Create notification (wrap in try-catch to not fail order if notification fails)
    try {
      const notification = await Notification.createOrderNotification(order);
      
      // Broadcast notification via SSE to all connected admins
      if (typeof broadcastNotification === 'function') {
        broadcastNotification(notification);
      }
      if (typeof broadcastUnreadCount === 'function') {
        broadcastUnreadCount();
      }
    } catch (notifError) {
      console.warn('⚠️ Notification creation failed:', notifError.message);
      // Continue anyway - order is created successfully
    }

    console.log("✅ Order created:", order.orderNumber);

    const orderData = order.toObject();
    delete orderData.guestAccessTokenHash;

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: orderData,
      ...(guestAccessToken && { accessToken: guestAccessToken })
    });
  } catch (error) {
    console.error('💥 Create order error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/order/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'addressInfo.name': { $regex: search, $options: 'i' } },
        { 'addressInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/order/user/:userId
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (String(req.user._id) !== String(userId) && !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments({ userId });

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/order/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { orderNumber: String(id) };
    const order = await Order.findOne(query)
      .select('+guestAccessTokenHash')
      .populate('userId', 'name email phone')
      .populate('cartItems.product');

    // Respond 404 (not 403) so order ids can't be probed
    if (!order || !canViewOrder(order, req.user, req.query.token)) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderData = order.toObject();
    delete orderData.guestAccessTokenHash;

    res.json({
      success: true,
      order: orderData
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/order/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, trackingNumber, courierService } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status with history
    await order.updateStatus(status, note, req.user?._id);

    // Update tracking info if provided
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierService) order.courierService = courierService;

    await order.save();

    // Create notification for status change
    try {
      const notification = await Notification.create({
        type: 'order',
        title: 'Order Status Updated',
        message: `Order ${order.orderNumber} status changed to ${status}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        priority: 'medium'
      });

      // Broadcast notification via SSE
      if (typeof broadcastNotification === 'function') {
        broadcastNotification(notification);
      }
      if (typeof broadcastUnreadCount === 'function') {
        broadcastUnreadCount();
      }
    } catch (notifError) {
      console.warn('⚠️ Notification creation failed:', notifError.message);
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// @desc    Update order admin notes
// @route   PUT /api/order/:id/notes
// @access  Private/Admin
exports.updateOrderNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { adminNotes },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin notes updated',
      order
    });
  } catch (error) {
    console.error('Update order notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notes',
      error: error.message
    });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/order/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/order/admin/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};