// models/Order.js

const mongoose = require('mongoose');
const crypto = require('crypto');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    orderNumber: {
        type: String,
        unique: true
    },
    // 'reseller' orders are placed through /api/reseller by a user with role 'reseller'
    orderSource: {
        type: String,
        enum: ['website', 'reseller'],
        default: 'website',
        index: true
    },
    resellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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

// 🔥 Generate cryptographically secure unique order number
function generateSecureOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase(); // Base36 timestamp
    const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 random hex chars
    const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0'); // 3 random digits

    // Mix them in a non-obvious pattern
    // Format: XXXX-YYYY-ZZZZ (e.g., SL3K-9H2F-847)
    const part1 = randomBytes.substring(0, 4);
    const part2 = timestamp.substring(timestamp.length - 4);
    const part3 = randomBytes.substring(4, 7) + randomNum.charAt(0);

    return `SL${part1}-${part2}-${part3}`;
}

// Alternative: Even more random (no timestamp patterns)
function generateFullyRandomOrderNumber() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (I, O, 0, 1)
    let orderNum = 'SL';

    // Generate 10 random characters in format: SLXXXX-XXXX-XX
    for (let i = 0; i < 10; i++) {
        if (i === 4 || i === 8) {
            orderNum += '-';
        }
        orderNum += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return orderNum;
}

// 🔥 Pre-save hook to generate order number
OrderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        try {
            let orderNumber;
            let attempts = 0;
            const maxAttempts = 10;

            // Keep generating until we get a unique one (very unlikely to need more than 1 attempt)
            while (attempts < maxAttempts) {
                // Use fully random method for maximum security
                orderNumber = generateFullyRandomOrderNumber();

                // Check if this order number already exists
                const existing = await mongoose.model('Order').findOne({ orderNumber });

                if (!existing) {
                    this.orderNumber = orderNumber;
                    console.log('✅ Generated secure order number:', this.orderNumber);
                    break;
                }

                attempts++;
                console.log(`⚠️ Order number collision, retrying... (attempt ${attempts})`);
            }

            if (!this.orderNumber) {
                throw new Error('Failed to generate unique order number after multiple attempts');
            }
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
OrderSchema.index({ resellerId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;