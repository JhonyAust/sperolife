// backend/controllers/bannerController.js
const Banner = require('../models/Banner');

// backend/controllers/bannerController.js
exports.getActiveBanners = async(req, res) => {
    try {
        const now = new Date();
        const { device } = req.query;

        // Base query for active banners
        const query = { isActive: true };

        // If device is specified as mobile, filter by isMobile
        if (device === 'mobile') {
            query.isMobile = true;
        } else if (device === 'desktop') {
            query.isMobile = false;
        }

        console.log('🔍 Query:', JSON.stringify(query));
        console.log('📱 Device param:', device);

        const banners = await Banner.find(query)
            .select('-__v')
            .sort({ position: 1 })
            .lean();

        console.log('📊 Found banners before date filter:', banners.length);

        // Filter by dates in JavaScript
        const activeBanners = banners.filter(banner => {
            if (!banner.startDate && !banner.endDate) {
                return true;
            }

            if (banner.startDate && !banner.endDate) {
                return new Date(banner.startDate) <= now;
            }

            if (!banner.startDate && banner.endDate) {
                return new Date(banner.endDate) >= now;
            }

            if (banner.startDate && banner.endDate) {
                return new Date(banner.startDate) <= now && new Date(banner.endDate) >= now;
            }

            return true;
        });

        console.log('✅ Active banners after date filter:', activeBanners.length);

        res.json({
            success: true,
            count: activeBanners.length,
            data: activeBanners,
        });
    } catch (error) {
        console.error('Get active banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners',
            error: error.message,
        });
    }
};

// @desc    Get single banner by ID
// @route   GET /api/banners/:id
// @access  Public
exports.getBannerById = async(req, res) => {
    try {
        const banner = await Banner.findOne({
            _id: req.params.id,
            isActive: true,
        }).select('-__v');

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        // Check if banner is within date range
        const now = new Date();
        if (banner.startDate && new Date(banner.startDate) > now) {
            return res.status(404).json({
                success: false,
                message: 'Banner not available yet',
            });
        }
        if (banner.endDate && new Date(banner.endDate) < now) {
            return res.status(404).json({
                success: false,
                message: 'Banner has expired',
            });
        }

        res.json({
            success: true,
            data: banner,
        });
    } catch (error) {
        console.error('Get banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banner',
            error: error.message,
        });
    }
};