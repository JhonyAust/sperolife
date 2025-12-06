// backend/models/Banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
        type: String,
        required: [true, 'Banner image is required'],
    },
    link: {
        type: String,
        trim: true,
    },
    linkText: {
        type: String,
        trim: true,
        default: 'Shop Now',
    },
    position: {
        type: Number,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isMobile: {
        type: Boolean,
        default: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    backgroundColor: {
        type: String,
        default: '#000000',
    },
    textColor: {
        type: String,
        default: '#ffffff',
    },
    buttonColor: {
        type: String,
        default: '#FD0002',
    },
}, {
    timestamps: true,
});

// Index for faster queries
bannerSchema.index({ position: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ isMobile: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Banner', bannerSchema);