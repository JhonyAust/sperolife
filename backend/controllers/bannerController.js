// backend/controllers/bannerController.js
const Banner = require('../models/Banner');

// @desc    Get active banners for users
// @route   GET /api/banners
// @access  Public
exports.getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    
    // Simplified query - just get active banners first
    const query = { isActive: true };
    
    const banners = await Banner.find(query)
      .select('-__v')
      .sort({ position: 1 })
      .lean();

    console.log('Found banners:', banners.length);
    console.log('Banner details:', JSON.stringify(banners, null, 2));

    // Filter by dates in JavaScript for better control
    const activeBanners = banners.filter(banner => {
      // If no dates are set, show the banner
      if (!banner.startDate && !banner.endDate) {
        return true;
      }
      
      // If only startDate is set, check if it has started
      if (banner.startDate && !banner.endDate) {
        return new Date(banner.startDate) <= now;
      }
      
      // If only endDate is set, check if it hasn't ended
      if (!banner.startDate && banner.endDate) {
        return new Date(banner.endDate) >= now;
      }
      
      // If both dates are set, check if current time is within range
      if (banner.startDate && banner.endDate) {
        return new Date(banner.startDate) <= now && new Date(banner.endDate) >= now;
      }
      
      return true;
    });

    console.log('Active banners after date filter:', activeBanners.length);

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
exports.getBannerById = async (req, res) => {
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