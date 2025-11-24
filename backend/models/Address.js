const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Bangladesh phone number validation
                return /^(?:\+88|88)?01[3-9]\d{8}$/.test(v);
            },
            message: 'Please provide a valid Bangladesh mobile number'
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await mongoose.models.Address.updateMany({ userId: this.userId, _id: { $ne: this._id } }, { $set: { isDefault: false } });
    }
    next();
});

// Index for faster queries
addressSchema.index({ userId: 1 });

module.exports = mongoose.model('Address', addressSchema);