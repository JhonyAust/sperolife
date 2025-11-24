const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
      maxlength: [100, 'Coupon name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: {
        values: ['percentage', 'flat'],
        message: 'Discount type must be either percentage or flat',
      },
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
      validate: {
        validator: function (value) {
          if (this.discountType === 'percentage') {
            return value > 0 && value <= 100;
          }
          return value > 0;
        },
        message: 'Invalid discount value. Percentage must be between 0-100, flat must be positive.',
      },
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Maximum discount cannot be negative'],
      validate: {
        validator: function (value) {
          // Only validate if it's a percentage discount and maxDiscount is set
          if (this.discountType === 'percentage' && value) {
            return value > 0;
          }
          return true;
        },
        message: 'Maximum discount must be positive for percentage discounts',
      },
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      // ✅ REMOVED THE PROBLEMATIC VALIDATOR - validation moved to controller
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'expired'],
        message: 'Status must be active, inactive, or expired',
      },
      default: 'active',
    },
    applicableCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    excludedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    userRestrictions: {
      type: {
        type: String,
        enum: ['all', 'new', 'existing'],
        default: 'all',
      },
      minOrders: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
couponSchema.index({ couponCode: 1, status: 1 });
couponSchema.index({ expiryDate: 1, status: 1 });
couponSchema.index({ status: 1, startDate: 1 });

// Virtual for checking if coupon is valid
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  
  // Check status
  if (this.status !== 'active') return false;
  
  // Check dates
  if (this.startDate && now < this.startDate) return false;
  if (this.expiryDate && now > this.expiryDate) return false;
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  return true;
});

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function () {
  if (!this.usageLimit) return 'Unlimited';
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Ensure virtuals are included in JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

// Pre-save middleware to auto-update status based on expiry
couponSchema.pre('save', function (next) {
  const now = new Date();
  
  // ✅ Validate expiry date vs start date (only during save)
  if (this.expiryDate && this.startDate && this.expiryDate <= this.startDate) {
    return next(new Error('Expiry date must be after start date'));
  }
  
  if (this.expiryDate && now > this.expiryDate && this.status === 'active') {
    this.status = 'expired';
  }
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit && this.status === 'active') {
    this.status = 'inactive';
  }
  
  next();
});

// Static method to validate coupon
couponSchema.statics.validateCoupon = async function (couponCode, orderAmount, userId, cartItems) {
  const coupon = await this.findOne({
    couponCode: couponCode.toUpperCase(),
  }).populate('excludedProducts');

  if (!coupon) {
    throw new Error('Invalid coupon code');
  }

  const now = new Date();

  // Check status
  if (coupon.status !== 'active') {
    throw new Error('This coupon is not active');
  }

  // Check start date
  if (coupon.startDate && now < coupon.startDate) {
    throw new Error('This coupon is not yet valid');
  }

  // Check expiry
  if (coupon.expiryDate && now > coupon.expiryDate) {
    throw new Error('This coupon has expired');
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('This coupon has reached its usage limit');
  }

  // Check minimum purchase
  if (orderAmount < coupon.minPurchase) {
    throw new Error(`Minimum purchase of ৳${coupon.minPurchase} required to use this coupon`);
  }

  // Check if cart has products with existing discounts
  const hasDiscountedProducts = cartItems.some(item => {
    return item.salePrice && item.salePrice < item.price;
  });

  if (hasDiscountedProducts) {
    throw new Error('Coupon cannot be applied to products that already have discounts');
  }

  // Check excluded products
  if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
    const excludedIds = coupon.excludedProducts.map(p => p._id.toString());
    const hasExcluded = cartItems.some(item => 
      excludedIds.includes(item.product?.toString() || item.productId?.toString())
    );
    
    if (hasExcluded) {
      throw new Error('Some products in your cart are not eligible for this coupon');
    }
  }

  return coupon;
};

// Instance method to calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    // Apply max discount if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }

  // Discount cannot exceed order amount
  discount = Math.min(discount, orderAmount);

  return Math.round(discount);
};

// Instance method to increment usage
couponSchema.methods.incrementUsage = async function () {
  this.usedCount += 1;
  
  // Auto-deactivate if usage limit reached
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    this.status = 'inactive';
  }
  
  return await this.save();
};

module.exports = mongoose.model('Coupon', couponSchema);