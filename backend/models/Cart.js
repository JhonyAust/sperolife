const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    price: Number,
    salePrice: Number, // ✅ Added salePrice field
    image: String,
    size: {
        type: String,
        required: true
    },
    color: String,
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    stock: Number
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update timestamp on save
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cart', cartSchema);