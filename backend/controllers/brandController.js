// controllers/brandController.js
const Brand = require('../models/Brand');

const MAX_LOGO_URL_LENGTH = 1000;

const toBrandResponse = (brand) => ({
    name: brand.name,
    key: brand.key,
    logo: brand.logo || null,
    updatedAt: brand.updatedAt,
});

// @desc    Get brand logos uploaded by the admin
// @route   GET /api/brands
// @access  Public
exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({ logo: { $nin: [null, ''] } })
            .sort({ updatedAt: -1 })
            .lean();
        res.json({ success: true, brands: brands.map(toBrandResponse) });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch brands' });
    }
};

// @desc    Get all brand settings
// @route   GET /api/admin/brands
// @access  Private/Admin
exports.getAdminBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ name: 1 }).lean();
        res.json({ success: true, brands: brands.map(toBrandResponse) });
    } catch (error) {
        console.error('Get admin brands error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch brands' });
    }
};

// @desc    Set a brand's logo (creates the brand if needed). `logo: null` restores the default logo.
// @route   PUT /api/admin/brands
// @access  Private/Admin
exports.upsertBrand = async (req, res) => {
    try {
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
        const { logo } = req.body || {};
        const key = Brand.normalizeKey(name);

        if (!name || !key || name.length > 60) {
            return res.status(400).json({ success: false, message: 'A valid brand name is required' });
        }
        if (logo !== null && logo !== undefined) {
            if (
                typeof logo !== 'string' ||
                logo.length > MAX_LOGO_URL_LENGTH ||
                !/^https?:\/\/\S+$/i.test(logo.trim())
            ) {
                return res.status(400).json({ success: false, message: 'Logo must be an image URL' });
            }
        }

        const brand = await Brand.findOneAndUpdate(
            { key },
            { $set: { name, logo: logo ? logo.trim() : null } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        res.json({
            success: true,
            message: brand.logo ? 'Brand logo updated' : 'Brand logo reset to default',
            brand: toBrandResponse(brand),
        });
    } catch (error) {
        console.error('Upsert brand error:', error);
        res.status(500).json({ success: false, message: 'Failed to update brand' });
    }
};
