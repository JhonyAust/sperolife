// backend/models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please provide announcement text'],
        trim: true,
        maxlength: [200, 'Announcement text cannot exceed 200 characters'],
    },
    isActive: {
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
        default: '#FD0002', // btn-primary color
    },
    textColor: {
        type: String,
        default: '#ffffff',
    },
    icon: {
        type: String,
        enum: ['zap', 'sparkles', 'gift', 'star', 'heart', 'bell', 'tag'],
        default: 'zap',
    },
    link: {
        type: String,
        trim: true,
    },
    priority: {
        type: Number,
        default: 1,
        min: 1,
    },
}, {
    timestamps: true,
});

// Index for efficient queries
announcementSchema.index({ isActive: 1, priority: 1 });
announcementSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);