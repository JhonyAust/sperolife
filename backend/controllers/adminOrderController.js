// controllers/adminOrderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const PDFDocument = require('pdfkit');
const { broadcastNotification, broadcastUnreadCount } = require('../routes/notificationSSE');

// ✅ Helper function to find order by ID or orderNumber
const findOrderByIdOrNumber = async (identifier) => {
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(identifier);
  
  if (isMongoId) {
    return await Order.findById(identifier);
  } else {
    return await Order.findOne({ orderNumber: identifier });
  }
};

// @desc    Get all orders with advanced filters (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus,
      paymentMethod,
      orderSource,
      page = 1, 
      limit = 20, 
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Status filter
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    
    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    // Order source filter (orders created before this field existed count as website orders)
    if (orderSource === 'reseller') {
      query.orderSource = 'reseller';
    } else if (orderSource === 'website') {
      query.orderSource = { $ne: 'reseller' };
    }
    
    // Search by order number, customer name, or phone
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'addressInfo.name': { $regex: search, $options: 'i' } },
        { 'addressInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('resellerId', 'name email')
      .populate('cartItems.product', 'name category')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID or Order Number (Admin)
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Backend - Received ID:', id);

    let order;
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isMongoId) {
      // Valid MongoDB ObjectId format
      console.log('📦 Backend - Searching by MongoDB ID:', id);
      order = await Order.findById(id)
        .populate('userId', 'name email phone')
        .populate('cartItems.product', 'name category brand')
        .populate('statusHistory.updatedBy', 'name');
    } else {
      // Treat as order number (supports any format: ORD-2025-000001, SL2EHL-NZHJ-8K, etc.)
      console.log('📦 Backend - Searching by order number:', id);
      order = await Order.findOne({ orderNumber: id })
        .populate('userId', 'name email phone')
        .populate('cartItems.product', 'name category brand')
        .populate('statusHistory.updatedBy', 'name');
    }

    if (!order) {
      console.log('❌ Backend - Order not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Backend - Order found:', order.orderNumber);
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('❌ Backend - Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, trackingNumber, courierService } = req.body;

    console.log('🔄 Updating order status:', id, '→', status);

    const order = await findOrderByIdOrNumber(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    // Update status with history
    await order.updateStatus(status, note, req.user?._id);

    // Update tracking info if provided
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierService) order.courierService = courierService;

    // Update payment status if order is delivered
    if (status === 'delivered' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'paid';
    }

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
        priority: status === 'cancelled' ? 'high' : 'medium'
      });

      if (typeof broadcastNotification === 'function') {
        broadcastNotification(notification);
      }
      if (typeof broadcastUnreadCount === 'function') {
        broadcastUnreadCount();
      }
    } catch (notifError) {
      console.warn('⚠️ Notification creation failed:', notifError.message);
    }

    console.log('✅ Order status updated:', order.orderNumber);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// @desc    Update payment status (Admin)
// @route   PUT /api/admin/orders/:id/payment-status
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, note } = req.body;

    console.log('💳 Updating payment status:', id, '→', paymentStatus);

    const order = await findOrderByIdOrNumber(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate payment status
    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    // Update payment status
    order.paymentStatus = paymentStatus;

    // Add to status history
    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Payment status updated to ${paymentStatus}${note ? ': ' + note : ''}`,
      updatedBy: req.user?._id
    });

    await order.save();

    // Create notification
    try {
      const notification = await Notification.create({
        type: 'order',
        title: 'Payment Status Updated',
        message: `Payment status for order ${order.orderNumber} changed to ${paymentStatus}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        priority: 'medium'
      });

      if (typeof broadcastNotification === 'function') {
        broadcastNotification(notification);
      }
      if (typeof broadcastUnreadCount === 'function') {
        broadcastUnreadCount();
      }
    } catch (notifError) {
      console.warn('⚠️ Notification creation failed:', notifError.message);
    }

    console.log('✅ Payment status updated:', order.orderNumber);

    res.json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      order
    });
  } catch (error) {
    console.error('❌ Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// @desc    Cancel order (Admin)
// @route   PUT /api/admin/orders/:id/cancel
// @access  Private/Admin
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('🚫 Cancelling order:', id);

    const order = await findOrderByIdOrNumber(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered order'
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Restore product stock
    for (const item of order.cartItems) {
      const product = await Product.findById(item.product);
      
      if (product) {
        if (product.hasSizeVariants && product.sizeVariants && product.sizeVariants.length > 0) {
          const sizeIndex = product.sizeVariants.findIndex(s => s.size === item.size);
          if (sizeIndex !== -1) {
            product.sizeVariants[sizeIndex].stock += item.quantity;
          }
        } else {
          product.stock += item.quantity;
        }
        
        await product.save();
        console.log(`✅ Restored ${item.quantity} stock for ${item.title}`);
      }
    }

    // Update order status to cancelled
    await order.updateStatus('cancelled', reason || 'Cancelled by admin', req.user?._id);
    order.paymentStatus = 'failed';
    await order.save();

    // Create notification
    try {
      const notification = await Notification.create({
        type: 'order',
        title: 'Order Cancelled',
        message: `Order ${order.orderNumber} has been cancelled`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        priority: 'high'
      });

      if (typeof broadcastNotification === 'function') {
        broadcastNotification(notification);
      }
      if (typeof broadcastUnreadCount === 'function') {
        broadcastUnreadCount();
      }
    } catch (notifError) {
      console.warn('⚠️ Notification creation failed:', notifError.message);
    }

    console.log('✅ Order cancelled:', order.orderNumber);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/admin/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    console.log('🗑️ Deleting order:', id);

    let order;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isMongoId) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow deletion of cancelled orders or test orders
    if (order.orderStatus !== 'cancelled' && !permanent) {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled orders can be deleted. Cancel the order first.'
      });
    }

    // Delete the order
    if (isMongoId) {
      await Order.findByIdAndDelete(id);
    } else {
      await Order.findOneAndDelete({ orderNumber: id });
    }

    console.log('✅ Order deleted:', order.orderNumber);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

// @desc    Update admin notes
// @route   PUT /api/admin/orders/:id/notes
// @access  Private/Admin
exports.updateOrderNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    console.log('📝 Updating admin notes:', id);

    const order = await findOrderByIdOrNumber(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.adminNotes = adminNotes;
    await order.save();

    console.log('✅ Admin notes updated:', order.orderNumber);

    res.json({
      success: true,
      message: 'Admin notes updated',
      order
    });
  } catch (error) {
    console.error('❌ Update order notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notes',
      error: error.message
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/admin/orders/stats
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
      { $match: { orderStatus: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const pendingRevenue = await Order.aggregate([
      { $match: { orderStatus: { $in: ['pending', 'confirmed', 'processing', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Orders by payment method
    const paymentMethodStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
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
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0,
        recentOrders,
        paymentMethodStats
      }
    });
  } catch (error) {
    console.error('❌ Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// @desc    Generate and download invoice (Admin)
// @route   GET /api/admin/orders/:id/invoice
// @access  Private/Admin
exports.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📄 Generating invoice for:', id);

    let order;
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isMongoId) {
      order = await Order.findById(id)
        .populate('userId', 'name email phone')
        .populate('cartItems.product', 'name');
    } else {
      order = await Order.findOne({ orderNumber: id })
        .populate('userId', 'name email phone')
        .populate('cartItems.product', 'name');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only generate invoice for confirmed or later status orders
    if (order.orderStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate invoice for pending orders'
      });
    }

    console.log('✅ Generating invoice for:', order.orderNumber);

    // Create PDF document with proper font support
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Company Info
    doc.fontSize(10).font('Helvetica-Bold').text('SperoLife', 50, 120);
    doc.fontSize(9).font('Helvetica').text('Eastern Banabithi Shopping Complex (10 Tola Market)', 50, 133);
    doc.text('South Banasree Dhaka 1219', 50, 144);
    doc.text('Phone: +880 1750-873525', 50, 155);
    doc.text('Email: sperolifebd@gmail.com', 50, 166);

    // Invoice Details
    doc.fontSize(9).font('Helvetica-Bold').text('Invoice Number:', 350, 120);
    doc.font('Helvetica').text(order.orderNumber, 440, 120);
    
    doc.font('Helvetica-Bold').text('Order Date:', 350, 133);
    doc.font('Helvetica').text(new Date(order.createdAt).toLocaleDateString(), 440, 133);
    
    doc.font('Helvetica-Bold').text('Status:', 350, 146);
    doc.font('Helvetica').text(order.orderStatus.toUpperCase(), 440, 146);

    // Line separator
    doc.moveTo(50, 185).lineTo(550, 185).stroke();

    // Customer Info
    doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, 200);
    doc.fontSize(9).font('Helvetica').text(order.addressInfo.name, 50, 213);
    doc.text(order.addressInfo.address, 50, 224);
    doc.text(`${order.addressInfo.city}, ${order.addressInfo.pincode}`, 50, 235);
    doc.text(`Phone: ${order.addressInfo.phone}`, 50, 246);

    // Items Table Header
    const tableTop = 280;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Size', 280, tableTop);
    doc.text('Qty', 350, tableTop);
    doc.text('Price', 420, tableTop);
    doc.text('Total', 490, tableTop, { align: 'right' });

    // Line under header
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Items
    let yPosition = tableTop + 25;
    doc.font('Helvetica');
    
    order.cartItems.forEach((item) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(item.title, 50, yPosition, { width: 220 });
      doc.text(item.size || 'N/A', 280, yPosition);
      doc.text(item.quantity.toString(), 350, yPosition);
      doc.text(`BDT ${item.price.toFixed(2)}`, 420, yPosition);
      doc.text(`BDT ${(item.price * item.quantity).toFixed(2)}`, 490, yPosition, { align: 'right' });
      
      yPosition += 25;
    });

    // Line before totals
    yPosition += 10;
    doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 15;

    // Totals
    const subtotal = order.totalAmount - order.shippingCharge + order.discountAmount;
    
    doc.font('Helvetica');
    doc.text('Subtotal:', 400, yPosition);
    doc.text(`BDT ${subtotal.toFixed(2)}`, 490, yPosition, { align: 'right' });
    yPosition += 20;

    if (order.discountAmount > 0) {
      doc.text('Discount:', 400, yPosition);
      doc.text(`-BDT ${order.discountAmount.toFixed(2)}`, 490, yPosition, { align: 'right' });
      yPosition += 20;
    }

    doc.text('Shipping:', 400, yPosition);
    doc.text(`BDT ${order.shippingCharge.toFixed(2)}`, 490, yPosition, { align: 'right' });
    yPosition += 20;

    // Final Total
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Total Amount:', 400, yPosition);
    doc.text(`BDT ${order.totalAmount.toFixed(2)}`, 490, yPosition, { align: 'right' });

    // Payment Info
    yPosition += 40;
    doc.fontSize(9).font('Helvetica');
    doc.text(`Payment Method: ${order.paymentMethod}`, 50, yPosition);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, yPosition + 15);

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      'Thank you for your business!',
      50,
      doc.page.height - 50,
      { align: 'center', width: 500 }
    );

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('❌ Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

// @desc    Bulk update orders
// @route   PUT /api/admin/orders/bulk-update
// @access  Private/Admin
exports.bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, status, note } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs are required'
      });
    }

    const updatedOrders = [];
    
    for (const orderId of orderIds) {
      const order = await findOrderByIdOrNumber(orderId);
      if (order) {
        await order.updateStatus(status, note, req.user?._id);
        updatedOrders.push(order);
      }
    }

    res.json({
      success: true,
      message: `${updatedOrders.length} orders updated successfully`,
      orders: updatedOrders
    });
  } catch (error) {
    console.error('❌ Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update orders',
      error: error.message
    });
  }
};