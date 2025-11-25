const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

// @desc    Get all coupons (Admin)
// @route   GET /api/admin/coupons
// @access  Private/Admin
exports.getAllCoupons = async(req, res) => {
    try {
        const { status, search, sort = '-createdAt' } = req.query;

        let query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search by code or name
        if (search) {
            query.$or = [
                { couponCode: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        const coupons = await Coupon.find(query)
            .populate('excludedProducts', 'name image')
            .sort(sort);

        // Update expired coupons
        const now = new Date();
        const updatePromises = coupons.map(async(coupon) => {
            if (coupon.expiryDate && now > coupon.expiryDate && coupon.status === 'active') {
                coupon.status = 'expired';
                await coupon.save();
            }
        });
        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            count: coupons.length,
            coupons,
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coupons',
            error: error.message,
        });
    }
};

// @desc    Get single coupon (Admin)
// @route   GET /api/admin/coupons/:id
// @access  Private/Admin
exports.getCoupon = async(req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id).populate('excludedProducts', 'name image');

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        res.status(200).json({
            success: true,
            coupon,
        });
    } catch (error) {
        console.error('Get coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coupon',
            error: error.message,
        });
    }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/admin/coupons
// @access  Private/Admin
exports.createCoupon = async(req, res) => {
    try {
        const {
            couponCode,
            name,
            description,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            startDate,
            expiryDate,
            usageLimit,
            status,
            applicableCategories,
            excludedProducts,
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({
            couponCode: couponCode.toUpperCase(),
        });

        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists',
            });
        }

        // Validate discount value
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount must be between 1 and 100',
            });
        }

        if (discountType === 'flat' && discountValue <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Flat discount must be greater than 0',
            });
        }

        // ✅ Validate expiry date
        if (expiryDate && startDate) {
            const start = new Date(startDate);
            const expiry = new Date(expiryDate);
            if (expiry <= start) {
                return res.status(400).json({
                    success: false,
                    message: 'Expiry date must be after start date',
                });
            }
        }

        const coupon = await Coupon.create({
            couponCode: couponCode.toUpperCase(),
            name,
            description,
            discountType,
            discountValue,
            minPurchase: minPurchase || 0,
            maxDiscount,
            startDate: startDate || Date.now(),
            expiryDate,
            usageLimit,
            status: status || 'active',
            applicableCategories,
            excludedProducts,
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon,
        });
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create coupon',
            error: error.message,
        });
    }
};

// @desc    Update coupon (Admin)
// @route   PATCH /api/admin/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async(req, res) => {
    try {
        let coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        // If updating coupon code, check for duplicates
        if (req.body.couponCode && req.body.couponCode !== coupon.couponCode) {
            const existingCoupon = await Coupon.findOne({
                couponCode: req.body.couponCode.toUpperCase(),
                _id: { $ne: req.params.id },
            });

            if (existingCoupon) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon code already exists',
                });
            }
            req.body.couponCode = req.body.couponCode.toUpperCase();
        }

        // Validate discount value if being updated
        if (req.body.discountValue) {
            const discountType = req.body.discountType || coupon.discountType;

            if (discountType === 'percentage' && (req.body.discountValue <= 0 || req.body.discountValue > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Percentage discount must be between 1 and 100',
                });
            }

            if (discountType === 'flat' && req.body.discountValue <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Flat discount must be greater than 0',
                });
            }
        }

        // ✅ Validate expiry date vs start date
        if (req.body.expiryDate) {
            const startDate = req.body.startDate ? new Date(req.body.startDate) : coupon.startDate;
            const expiryDate = new Date(req.body.expiryDate);

            if (startDate && expiryDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Expiry date must be after start date',
                });
            }
        }

        // ✅ Use .save() instead of findByIdAndUpdate for better validation support
        Object.keys(req.body).forEach(key => {
            coupon[key] = req.body[key];
        });

        await coupon.save();

        // Populate after save
        coupon = await Coupon.findById(req.params.id).populate('excludedProducts', 'name image');

        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            coupon,
        });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update coupon',
            error: error.message,
        });
    }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async(req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        await coupon.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete coupon',
            error: error.message,
        });
    }
};

// @desc    Toggle coupon status (Admin)
// @route   PATCH /api/admin/coupons/:id/toggle-status
// @access  Private/Admin
exports.toggleCouponStatus = async(req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            });
        }

        coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
        await coupon.save();

        res.status(200).json({
            success: true,
            message: `Coupon ${coupon.status === 'active' ? 'activated' : 'deactivated'} successfully`,
            coupon,
        });
    } catch (error) {
        console.error('Toggle coupon status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle coupon status',
            error: error.message,
        });
    }
};

// @desc    Validate and apply coupon (Checkout)
// @route   POST /api/checkout/apply-coupon
// @access  Public
exports.validateAndApplyCoupon = async(req, res) => {
    try {
        const { couponCode, orderAmount, userId, cartItems } = req.body;

        if (!couponCode || !orderAmount || !cartItems || cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        const hasDiscountedProducts = cartItems.some(item => {
            const salePrice = item.salePrice || item.sale_price;
            const regularPrice = item.price || item.regularPrice || item.regular_price;
            return salePrice &&
                regularPrice &&
                Number(salePrice) > 0 &&
                Number(salePrice) < Number(regularPrice);
        });

        if (hasDiscountedProducts) {
            return res.status(400).json({
                success: false,
                message: 'Coupon cannot be applied to products that already have discounts',
            });
        }

        // Validate coupon using static method
        const coupon = await Coupon.validateCoupon(
            couponCode,
            orderAmount,
            userId,
            cartItems
        );

        // Calculate discount
        const discountAmount = coupon.calculateDiscount(orderAmount);
        const finalAmount = orderAmount - discountAmount;

        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            coupon: {
                _id: coupon._id,
                couponCode: coupon.couponCode,
                name: coupon.name,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount,
                finalAmount,
            },
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get coupon statistics (Admin)
// @route   GET /api/admin/coupons/stats
// @access  Private/Admin
exports.getCouponStats = async(req, res) => {
    try {
        const totalCoupons = await Coupon.countDocuments();
        const activeCoupons = await Coupon.countDocuments({ status: 'active' });
        const expiredCoupons = await Coupon.countDocuments({ status: 'expired' });

        const mostUsedCoupons = await Coupon.find()
            .sort({ usedCount: -1 })
            .limit(5)
            .select('couponCode name usedCount discountType discountValue');

        const recentCoupons = await Coupon.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('couponCode name status discountType discountValue createdAt');

        res.status(200).json({
            success: true,
            stats: {
                total: totalCoupons,
                active: activeCoupons,
                expired: expiredCoupons,
                inactive: totalCoupons - activeCoupons - expiredCoupons,
            },
            mostUsed: mostUsedCoupons,
            recent: recentCoupons,
        });
    } catch (error) {
        console.error('Get coupon stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch coupon statistics',
            error: error.message,
        });
    }
};