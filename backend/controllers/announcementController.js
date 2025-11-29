// backend/controllers/announcementController.js
const Announcement = require('../models/Announcement');

// @desc    Get active announcements for users
// @route   GET /api/announcements
// @access  Public
exports.getActiveAnnouncements = async(req, res) => {
    try {
        const now = new Date();

        // Get active announcements
        const query = { isActive: true };

        const announcements = await Announcement.find(query)
            .select('-__v')
            .sort({ priority: 1 })
            .lean();

        // Filter by dates in JavaScript for better control
        const activeAnnouncements = announcements.filter(announcement => {
            // If no dates are set, show the announcement
            if (!announcement.startDate && !announcement.endDate) {
                return true;
            }

            // If only startDate is set, check if it has started
            if (announcement.startDate && !announcement.endDate) {
                return new Date(announcement.startDate) <= now;
            }

            // If only endDate is set, check if it hasn't ended
            if (!announcement.startDate && announcement.endDate) {
                return new Date(announcement.endDate) >= now;
            }

            // If both dates are set, check if current time is within range
            if (announcement.startDate && announcement.endDate) {
                return new Date(announcement.startDate) <= now && new Date(announcement.endDate) >= now;
            }

            return true;
        });

        res.json({
            success: true,
            count: activeAnnouncements.length,
            data: activeAnnouncements,
        });
    } catch (error) {
        console.error('Get active announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcements',
            error: error.message,
        });
    }
};

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
exports.getAnnouncementById = async(req, res) => {
    try {
        const announcement = await Announcement.findOne({
            _id: req.params.id,
            isActive: true,
        }).select('-__v');

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found',
            });
        }

        // Check if announcement is within date range
        const now = new Date();
        if (announcement.startDate && new Date(announcement.startDate) > now) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not available yet',
            });
        }
        if (announcement.endDate && new Date(announcement.endDate) < now) {
            return res.status(404).json({
                success: false,
                message: 'Announcement has expired',
            });
        }

        res.json({
            success: true,
            data: announcement,
        });
    } catch (error) {
        console.error('Get announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcement',
            error: error.message,
        });
    }
};