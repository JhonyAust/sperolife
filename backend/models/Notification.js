const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['order', 'product', 'user', 'system'],
        default: 'order'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    orderNumber: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

// Static method to create order notification
notificationSchema.statics.createOrderNotification = async function(order) {
    return this.create({
        type: 'order',
        title: 'New Order Received',
        message: `Order ${order.orderNumber} has been placed for ৳${order.totalAmount}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        priority: 'high'
    });
};

// Mark all as read
notificationSchema.statics.markAllAsRead = async function() {
    return this.updateMany({ isRead: false }, { $set: { isRead: true } });
};

module.exports = mongoose.model('Notification', notificationSchema);