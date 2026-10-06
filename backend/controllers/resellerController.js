// controllers/resellerController.js
//
// Reseller API. All routes require an authenticated user with role 'reseller'
// (see routes/resellerRoutes.js). Prices, titles, images and availability always
// come from the database — nothing price- or product-related is read from the request.
// Actual stock quantities are never returned; sizes only expose `available: true/false`.

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { SHIPPING_TYPES, calculateShippingCharge } = require('../helpers/shipping');
const { broadcastNotification, broadcastUnreadCount } = require('../routes/notificationSSE');

const ONE_SIZE = 'One Size'; // size label the website uses for products without size variants
const MAX_ITEMS_PER_ORDER = 20;
const MAX_QUANTITY_PER_ITEM = 50;
const MAX_PAGE_SIZE = 100;
const PAYMENT_METHODS = ['COD', 'Online', 'Card'];

// A product is resellable only when it is active, enabled for resellers by the admin
// and has a positive reseller price.
const RESELLABLE_QUERY = {
  isActive: true,
  isResellerAvailable: true,
  resellerPrice: { $gt: 0 },
};

const PRODUCT_FIELDS = 'name description images hasSizeVariants sizeVariants stock resellerPrice subCategory isActive isResellerAvailable';

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.limit, 10) || 12));
  return { page, limit, skip: (page - 1) * limit };
};

const isResellable = (product) =>
  Boolean(product && product.isActive && product.isResellerAvailable && product.resellerPrice > 0);

// [{ size, available }] — never includes the stock count
const toSizeAvailability = (product) => {
  if (product.hasSizeVariants && product.sizeVariants?.length > 0) {
    return product.sizeVariants.map((v) => ({ size: v.size, available: (v.stock || 0) > 0 }));
  }
  return [{ size: ONE_SIZE, available: (product.stock || 0) > 0 }];
};

const toResellerProduct = (product) => {
  const sizes = toSizeAvailability(product);
  return {
    id: product._id,
    title: product.name,
    description: product.description,
    image: product.images?.[0] || null,
    images: product.images || [],
    sizes,
    isAvailable: sizes.some((s) => s.available),
    resellingPrice: product.resellerPrice,
  };
};

// Order shape returned to resellers (no admin notes / internal user refs)
const toResellerOrder = (order) => {
  const items = order.cartItems.map((item) => ({
    productId: item.productId || String(item.product),
    title: item.title,
    image: item.image,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
    lineTotal: item.price * item.quantity,
  }));
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    items,
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    shippingType: order.shippingType,
    shippingCharge: order.shippingCharge,
    totalAmount: order.totalAmount,
    addressInfo: order.addressInfo,
    trackingNumber: order.trackingNumber || null,
    courierService: order.courierService || null,
    statusHistory: (order.statusHistory || []).map((h) => ({
      status: h.status,
      timestamp: h.timestamp,
      note: h.note,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    cancelledAt: order.cancelledAt || null,
  };
};

// Atomically take `quantity` from a product's stock, only if enough is left.
// Returns true when the stock was reserved.
const reserveStock = async (product, size, quantity) => {
  const filter = product.hasSizeVariants && product.sizeVariants?.length > 0
    ? { _id: product._id, sizeVariants: { $elemMatch: { size, stock: { $gte: quantity } } } }
    : { _id: product._id, stock: { $gte: quantity } };
  const update = product.hasSizeVariants && product.sizeVariants?.length > 0
    ? { $inc: { 'sizeVariants.$.stock': -quantity } }
    : { $inc: { stock: -quantity } };
  const result = await Product.updateOne(filter, update);
  return result.modifiedCount === 1;
};

const releaseStock = async (productId, size, quantity) => {
  const product = await Product.findById(productId).select('hasSizeVariants sizeVariants');
  if (!product) return;
  if (product.hasSizeVariants && product.sizeVariants?.length > 0) {
    await Product.updateOne(
      { _id: productId, 'sizeVariants.size': size },
      { $inc: { 'sizeVariants.$.stock': quantity } }
    );
  } else {
    await Product.updateOne({ _id: productId }, { $inc: { stock: quantity } });
  }
};

const notifyAdmins = async (createNotification) => {
  try {
    const notification = await createNotification();
    if (typeof broadcastNotification === 'function') broadcastNotification(notification);
    if (typeof broadcastUnreadCount === 'function') broadcastUnreadCount();
  } catch (error) {
    console.warn('⚠️ Reseller notification failed:', error.message);
  }
};

// Finds an order by Mongo id or order number, scoped to the given reseller
const findResellerOrder = (identifier, resellerId) => {
  const query = { resellerId, orderSource: 'reseller' };
  if (isObjectId(identifier)) query._id = identifier;
  else query.orderNumber = String(identifier);
  return Order.findOne(query);
};

// @desc    Get products available for reselling
// @route   GET /api/reseller/products
// @access  Private/Reseller
exports.getResellerProducts = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = { ...RESELLABLE_QUERY };

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const regex = { $regex: escapeRegex(search.slice(0, 100)), $options: 'i' };
      query.$or = [{ name: regex }, { description: regex }, { brand: regex }];
    }
    if (typeof req.query.category === 'string' && req.query.category) {
      query.category = { $regex: new RegExp(`^${escapeRegex(req.query.category)}$`, 'i') };
    }
    if (typeof req.query.subCategory === 'string' && req.query.subCategory) {
      query.subCategory = { $regex: new RegExp(`^${escapeRegex(req.query.subCategory)}$`, 'i') };
    }

    const [products, totalProducts] = await Promise.all([
      Product.find(query).select(PRODUCT_FIELDS).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products: products.map(toResellerProduct),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
      },
    });
  } catch (error) {
    console.error('❌ Get reseller products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// @desc    Get a single product available for reselling
// @route   GET /api/reseller/products/:id
// @access  Private/Reseller
exports.getResellerProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = isObjectId(id)
      ? await Product.findOne({ _id: id, ...RESELLABLE_QUERY }).select(PRODUCT_FIELDS).lean()
      : null;

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: toResellerProduct(product) });
  } catch (error) {
    console.error('❌ Get reseller product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// Validates and normalizes the request body. Only whitelisted fields are read —
// price, title, image, totals, coupons etc. sent by the client are ignored.
const parseOrderRequest = (body) => {
  const rawItems = Array.isArray(body.items)
    ? body.items
    : body.productId !== undefined
      ? [{ productId: body.productId, size: body.size, quantity: body.quantity }]
      : [];

  if (rawItems.length === 0) return { error: 'At least one item is required' };
  if (rawItems.length > MAX_ITEMS_PER_ORDER) return { error: `An order can contain at most ${MAX_ITEMS_PER_ORDER} items` };

  // Merge duplicate product+size lines so stock checks see the full quantity
  const merged = new Map();
  for (const raw of rawItems) {
    const productId = raw?.productId != null ? String(raw.productId) : '';
    const size = typeof raw?.size === 'string' ? raw.size.trim() : '';
    const quantity = Number(raw?.quantity);

    if (!isObjectId(productId)) return { error: 'Invalid product ID', status: 404 };
    if (!size || size.length > 30) return { error: 'A valid size is required for every item' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return { error: `Quantity must be a whole number between 1 and ${MAX_QUANTITY_PER_ITEM}` };
    }

    const key = `${productId}::${size.toLowerCase()}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += quantity;
    else merged.set(key, { productId, size, quantity });
  }
  const items = [...merged.values()];
  if (items.some((i) => i.quantity > MAX_QUANTITY_PER_ITEM)) {
    return { error: `Quantity must be a whole number between 1 and ${MAX_QUANTITY_PER_ITEM}` };
  }

  const info = body.addressInfo || {};
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const addressInfo = {
    name: str(info.name, 100),
    phone: str(info.phone, 20),
    address: str(info.address, 500),
    city: str(info.city, 100),
    pincode: str(info.pincode, 20),
    notes: str(info.notes, 500),
  };
  const missing = ['name', 'phone', 'address', 'city', 'pincode'].filter((f) => !addressInfo[f]);
  if (missing.length > 0) return { error: `Address information is incomplete: ${missing.join(', ')}` };
  if (!/^\+?[0-9][0-9\s-]{5,19}$/.test(addressInfo.phone)) return { error: 'Invalid phone number' };

  const shippingType = body.shippingType === undefined ? 'inside' : body.shippingType;
  if (!SHIPPING_TYPES.includes(shippingType)) {
    return { error: `shippingType must be one of: ${SHIPPING_TYPES.join(', ')}` };
  }

  const paymentMethod = body.paymentMethod === undefined ? 'COD' : body.paymentMethod;
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: `paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}` };
  }

  return { items, addressInfo, shippingType, paymentMethod };
};

// Resolves the stored size label for a requested size, or null if it doesn't exist
const resolveSize = (product, requested) => {
  if (product.hasSizeVariants && product.sizeVariants?.length > 0) {
    const variant = product.sizeVariants.find((v) => String(v.size).trim().toLowerCase() === requested.toLowerCase());
    return variant ? { size: variant.size, stock: variant.stock || 0 } : null;
  }
  return requested.toLowerCase() === ONE_SIZE.toLowerCase() ? { size: ONE_SIZE, stock: product.stock || 0 } : null;
};

// @desc    Place an order as a reseller
// @route   POST /api/reseller/orders
// @access  Private/Reseller
exports.createResellerOrder = async (req, res) => {
  const reserved = [];
  try {
    const parsed = parseOrderRequest(req.body || {});
    if (parsed.error) {
      return res.status(parsed.status || 400).json({ success: false, message: parsed.error });
    }
    const { items, addressInfo, shippingType, paymentMethod } = parsed;

    const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } })
      .select(PRODUCT_FIELDS)
      .lean();
    const productById = new Map(products.map((p) => [String(p._id), p]));

    // Validate every line before touching stock
    const lines = [];
    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not found', productId: item.productId });
      }
      if (!isResellable(product)) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is not available for reselling`,
          productId: item.productId,
        });
      }

      const resolved = resolveSize(product, item.size);
      if (!resolved) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} does not exist for ${product.name}`,
          productId: item.productId,
          availableSizes: toSizeAvailability(product),
        });
      }
      if (resolved.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: `Size ${resolved.size} of ${product.name} is out of stock`,
          productId: item.productId,
        });
      }
      if (resolved.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity is not available for ${product.name} (size ${resolved.size})`,
          productId: item.productId,
        });
      }

      lines.push({ product, size: resolved.size, quantity: item.quantity });
    }

    // Reserve stock atomically; roll back on any failure (e.g. a concurrent order took it)
    for (const line of lines) {
      const ok = await reserveStock(line.product, line.size, line.quantity);
      if (!ok) {
        await Promise.all(reserved.map((r) => releaseStock(r.product._id, r.size, r.quantity)));
        reserved.length = 0;
        return res.status(409).json({
          success: false,
          message: `Requested quantity is no longer available for ${line.product.name} (size ${line.size})`,
          productId: String(line.product._id),
        });
      }
      reserved.push(line);
    }

    // Prices come only from the admin-configured reseller price
    const cartItems = lines.map(({ product, size, quantity }) => ({
      product: product._id,
      productId: String(product._id),
      title: product.name,
      image: product.images?.[0] || '',
      price: product.resellerPrice,
      quantity,
      size,
    }));
    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCharge = calculateShippingCharge(lines.map((l) => l.product), shippingType);

    const order = new Order({
      userId: req.user._id,
      resellerId: req.user._id,
      orderSource: 'reseller',
      cartItems,
      addressInfo,
      paymentMethod,
      shippingCharge,
      shippingType,
      totalAmount: subtotal + shippingCharge,
      discountAmount: 0,
      orderStatus: 'pending',
      paymentStatus: 'pending',
    });
    await order.save();
    reserved.length = 0; // stock now belongs to the saved order

    await notifyAdmins(() => Notification.create({
      type: 'order',
      title: 'New Reseller Order',
      message: `Reseller order ${order.orderNumber} has been placed for ৳${order.totalAmount}`,
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      priority: 'high',
    }));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: toResellerOrder(order),
    });
  } catch (error) {
    console.error('💥 Create reseller order error:', error);
    if (reserved.length > 0) {
      await Promise.all(reserved.map((r) => releaseStock(r.product._id, r.size, r.quantity))).catch(() => {});
    }
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// @desc    Get the authenticated reseller's orders
// @route   GET /api/reseller/orders
// @access  Private/Reseller
exports.getResellerOrders = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const query = { resellerId: req.user._id, orderSource: 'reseller' };

    const { status } = req.query;
    if (typeof status === 'string' && status && status !== 'all') {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders: orders.map(toResellerOrder),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        limit,
      },
    });
  } catch (error) {
    console.error('❌ Get reseller orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// @desc    Get one of the authenticated reseller's orders (by id or order number)
// @route   GET /api/reseller/orders/:id
// @access  Private/Reseller
exports.getResellerOrderById = async (req, res) => {
  try {
    const order = await findResellerOrder(req.params.id, req.user._id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order: toResellerOrder(order) });
  } catch (error) {
    console.error('❌ Get reseller order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

// @desc    Cancel a reseller order — allowed only while it is still pending
//          (once the admin confirms it, cancellation goes through the admin panel)
// @route   PUT /api/reseller/orders/:id/cancel
// @access  Private/Reseller
exports.cancelResellerOrder = async (req, res) => {
  try {
    const existing = await findResellerOrder(req.params.id, req.user._id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 300) : '';
    const now = new Date();

    // Atomic status transition so a double request can't restore stock twice
    const order = await Order.findOneAndUpdate(
      { _id: existing._id, resellerId: req.user._id, orderStatus: 'pending' },
      {
        $set: { orderStatus: 'cancelled', cancelledAt: now, paymentStatus: 'failed' },
        $push: {
          statusHistory: {
            status: 'cancelled',
            timestamp: now,
            note: reason ? `Cancelled by reseller: ${reason}` : 'Cancelled by reseller',
            updatedBy: req.user._id,
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: existing.orderStatus === 'cancelled'
          ? 'Order is already cancelled'
          : `Order cannot be cancelled once it is ${existing.orderStatus}`,
      });
    }

    for (const item of order.cartItems) {
      if (item.isPreorder) continue;
      await releaseStock(item.product, item.size, item.quantity);
    }

    await notifyAdmins(() => Notification.create({
      type: 'order',
      title: 'Reseller Order Cancelled',
      message: `Reseller order ${order.orderNumber} has been cancelled by the reseller`,
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      priority: 'high',
    }));

    res.json({ success: true, message: 'Order cancelled successfully', order: toResellerOrder(order) });
  } catch (error) {
    console.error('❌ Cancel reseller order error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};
