// models/Order.js

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    orderNumber: {
        type: String,
        unique: true
            // Remove 'required: true' since we generate it automatically
    },
    cartItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productId: String,
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String, required: true },
        color: String
    }],
    addressInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        notes: String
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online', 'Card'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    shippingCharge: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingType: {
        type: String,
        enum: ['inside', 'outside'],
        default: 'inside'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    couponCode: String,
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    trackingNumber: String,
    courierService: String,
    adminNotes: String,
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date
}, {
    timestamps: true
});

// 🔥 CRITICAL: Generate order number before saving
OrderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        try {
            // Get count of all orders
            const count = await mongoose.model('Order').countDocuments();

            // Generate order number: ORD-YEAR-NNNNNN
            const year = new Date().getFullYear();
            const orderNum = String(count + 1).padStart(6, '0');
            this.orderNumber = `ORD-${year}-${orderNum}`;

            console.log('✅ Generated order number:', this.orderNumber);
        } catch (error) {
            console.error('❌ Error generating order number:', error);
            return next(error);
        }
    }

    // Add initial status to history
    if (this.isNew) {
        this.statusHistory = [{
            status: 'pending',
            timestamp: new Date(),
            note: 'Order created'
        }];
    }

    next();
});

// Method to update order status with history
OrderSchema.methods.updateStatus = async function(status, note, updatedBy) {
    this.orderStatus = status;

    // Add to status history
    this.statusHistory.push({
        status,
        timestamp: new Date(),
        note,
        updatedBy
    });

    // Set timestamp fields based on status
    if (status === 'confirmed' && !this.confirmedAt) {
        this.confirmedAt = new Date();
    } else if (status === 'shipped' && !this.shippedAt) {
        this.shippedAt = new Date();
    } else if (status === 'delivered' && !this.deliveredAt) {
        this.deliveredAt = new Date();
    } else if (status === 'cancelled' && !this.cancelledAt) {
        this.cancelledAt = new Date();
    }

    return await this.save();
};

// Index for faster queries
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;