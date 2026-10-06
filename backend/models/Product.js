// backend/models/Product.js
const mongoose = require('mongoose');

const sizeVariantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator: function (value) {
          return !value || value < this.price;
        },
        message: 'Sale price must be less than regular price',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    youtubeLink: {
      type: String,
      trim: true,
      validate: {
        validator: function(value) {
          if (!value) return true;
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
          return youtubeRegex.test(value);
        },
        message: 'Please provide a valid YouTube URL'
      }
    },
    hasSizeVariants: {
      type: Boolean,
      default: false,
    },
    sizeVariants: [sizeVariantSchema],
    stock: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    // Pre-order: when enabled, sizes that are out of stock can still be ordered
    isPreorderEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    preorderNote: {
      type: String,
      trim: true,
      maxlength: [120, 'Pre-order note cannot exceed 120 characters'],
      default: '',
    },
    // Reseller program: admin controls visibility and price for resellers
    isResellerAvailable: {
      type: Boolean,
      default: false,
      index: true,
    },
    resellerPrice: {
      type: Number,
      min: [0, 'Reseller price cannot be negative'],
      default: null,
    },
    // ✅ NEW: Hot Deals flag
    isHotDeals: {
      type: Boolean,
      default: false,
      index: true, // Index for efficient querying
    },
    views: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    metaTitle: {
      type: String,
      maxlength: [100, 'Meta title cannot exceed 100 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [200, 'Meta description cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ sku: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.salePrice && this.price > this.salePrice) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for total stock (including size variants)
productSchema.virtual('totalStock').get(function () {
  if (this.hasSizeVariants && this.sizeVariants.length > 0) {
    return this.sizeVariants.reduce((total, variant) => total + variant.stock, 0);
  }
  return this.stock;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function () {
  return this.totalStock > 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  const total = this.totalStock;
  if (total === 0) return 'Out of Stock';
  if (total <= 10) return 'Low Stock';
  return 'In Stock';
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Helper function to generate SKU
function generateSKU(prefix, category, uniqueId) {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${categoryCode}-${uniqueId || timestamp}`;
}

// Pre-save middleware to generate slug and SKU
productSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (!this.hasSizeVariants && !this.sku) {
    const basePrefix = this.brand ? this.brand.substring(0, 3).toUpperCase() : 'PRD';
    let attempt = 0;
    let skuGenerated = false;

    while (!skuGenerated && attempt < 10) {
      const uniqueId = Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();
      const potentialSKU = generateSKU(basePrefix, this.category, uniqueId);
      
      const existingSKU = await this.constructor.findOne({ sku: potentialSKU });
      if (!existingSKU) {
        this.sku = potentialSKU;
        skuGenerated = true;
      }
      attempt++;
    }
  }

  if (this.hasSizeVariants && this.sizeVariants && this.sizeVariants.length > 0) {
    const basePrefix = this.brand ? this.brand.substring(0, 3).toUpperCase() : 'PRD';
    
    for (let i = 0; i < this.sizeVariants.length; i++) {
      const variant = this.sizeVariants[i];
      
      if (!variant.sku) {
        let attempt = 0;
        let skuGenerated = false;

        while (!skuGenerated && attempt < 10) {
          const sizeCode = variant.size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          const uniqueId = Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();
          const potentialSKU = `${generateSKU(basePrefix, this.category, uniqueId)}-${sizeCode}`;
          
          const existingSKU = await this.constructor.findOne({
            'sizeVariants.sku': potentialSKU
          });
          
          if (!existingSKU) {
            variant.sku = potentialSKU;
            skuGenerated = true;
          }
          attempt++;
        }
      }
    }
  }

  next();
});

// Static method to get products by category
productSchema.statics.getByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get featured products
productSchema.statics.getFeatured = function (limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ rating: -1 })
    .limit(limit);
};

// ✅ NEW: Static method to get hot deals
productSchema.statics.getHotDeals = function (limit = 10) {
  return this.find({ isHotDeals: true, isActive: true })
    .sort({ discountPercentage: -1, createdAt: -1 })
    .limit(limit);
};

// Instance method to check if product is on sale
productSchema.methods.isOnSale = function () {
  return this.salePrice && this.salePrice < this.price;
};

// Static method to find product by SKU
productSchema.statics.findBySKU = async function (sku) {
  const product = await this.findOne({ sku });
  if (product) return product;

  return await this.findOne({ 'sizeVariants.sku': sku });
};

module.exports = mongoose.model('Product', productSchema);