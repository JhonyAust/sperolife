// models/Brand.js
// Admin-managed brand settings (currently the logo shown on the homepage brand tabs).
// Products still store their brand as free text; brands are matched by `key`.
const mongoose = require('mongoose');

// "  Louis-Vuitton " -> "louis vuitton", "L.V." -> "lv" (same rules as the frontend)
const normalizeBrandKey = (name) =>
    String(name || '')
        .toLowerCase()
        .replace(/[.'’]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Brand name is required'],
            trim: true,
            maxlength: [60, 'Brand name cannot exceed 60 characters'],
        },
        key: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        logo: {
            type: String,
            trim: true,
            default: null,
        },
    },
    { timestamps: true }
);

brandSchema.statics.normalizeKey = normalizeBrandKey;

module.exports = mongoose.model('Brand', brandSchema);
