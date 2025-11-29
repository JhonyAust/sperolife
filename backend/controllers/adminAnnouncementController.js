// backend/controllers/adminAnnouncementController.js
const Announcement = require('../models/Announcement');

// @desc    Create new announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
exports.createAnnouncement = async(req, res) => {
    try {
        const {
            text,
            isActive,
            startDate,
            endDate,
            backgroundColor,
            textColor,
            icon,
            link,
            priority,
        } = req.body;

        // Validation
        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide announcement text',
            });
        }

        // Get the highest priority if not provided
        let announcementPriority = priority;
        if (!announcementPriority) {
            const highestAnnouncement = await Announcement.findOne().sort({ priority: -1 });
            announcementPriority = highestAnnouncement ? highestAnnouncement.priority + 1 : 1;
        }

        // Prepare announcement data
        const announcementData = {
            text: text.trim(),
            priority: announcementPriority,
            isActive: isActive !== undefined ? isActive : true,
            backgroundColor: backgroundColor || '#FD0002',
            textColor: textColor || '#ffffff',
            icon: icon || 'zap',
        };

        // Add optional fields only if provided
        if (link && link.trim()) announcementData.link = link.trim();
        if (startDate) announcementData.startDate = startDate;
        if (endDate) announcementData.endDate = endDate;

        const announcement = await Announcement.create(announcementData);

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement,
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create announcement',
            error: error.message,
        });
    }
};

// @desc    Get all announcements
// @route   GET /api/admin/announcements
// @access  Private/Admin
exports.getAllAnnouncements = async(req, res) => {
    try {
        const announcements = await Announcement.find().sort({ priority: 1 });

        res.json({
            success: true,
            data: announcements,
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcements',
        });
    }
};

// @desc    Get announcement statistics
// @route   GET /api/admin/announcements/stats
// @access  Private/Admin
exports.getAnnouncementStats = async(req, res) => {
    try {
        const totalAnnouncements = await Announcement.countDocuments();
        const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
        const inactiveAnnouncements = await Announcement.countDocuments({ isActive: false });

        // Count scheduled announcements
        const now = new Date();
        const scheduledAnnouncements = await Announcement.countDocuments({
            $or: [
                { startDate: { $gt: now } },
                { endDate: { $gt: now } }
            ]
        });

        // Count announcements with links
        const linkedAnnouncements = await Announcement.countDocuments({
            link: { $exists: true, $ne: '' }
        });

        res.json({
            success: true,
            data: {
                totalAnnouncements,
                activeAnnouncements,
                inactiveAnnouncements,
                scheduledAnnouncements,
                linkedAnnouncements,
            },
        });
    } catch (error) {
        console.error('Get announcement stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcement statistics',
            error: error.message,
        });
    }
};

// @desc    Get single announcement
// @route   GET /api/admin/announcements/:id
// @access  Private/Admin
exports.getAnnouncementById = async(req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found',
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
        });
    }
};

// @desc    Update announcement
// @route   PUT /api/admin/announcements/:id
// @access  Private/Admin
exports.updateAnnouncement = async(req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found',
            });
        }

        const {
            text,
            isActive,
            startDate,
            endDate,
            backgroundColor,
            textColor,
            icon,
            link,
            priority,
        } = req.body;

        // Update fields
        if (text !== undefined) announcement.text = text.trim();
        if (typeof isActive === 'boolean') announcement.isActive = isActive;
        if (startDate !== undefined) announcement.startDate = startDate || undefined;
        if (endDate !== undefined) announcement.endDate = endDate || undefined;
        if (backgroundColor) announcement.backgroundColor = backgroundColor;
        if (textColor) announcement.textColor = textColor;
        if (icon) announcement.icon = icon;
        if (link !== undefined) announcement.link = link.trim() || undefined;
        if (priority !== undefined) announcement.priority = priority;

        await announcement.save();

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: announcement,
        });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update announcement',
            error: error.message,
        });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private/Admin
exports.deleteAnnouncement = async(req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found',
            });
        }

        await announcement.deleteOne();

        res.json({
            success: true,
            message: 'Announcement deleted successfully',
        });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete announcement',
        });
    }
};

// @desc    Toggle announcement status
// @route   PATCH /api/admin/announcements/:id/toggle-status
// @access  Private/Admin
exports.toggleAnnouncementStatus = async(req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found',
            });
        }

        announcement.isActive = !announcement.isActive;
        await announcement.save();

        res.json({
            success: true,
            message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'} successfully`,
            data: announcement,
        });
    } catch (error) {
        console.error('Toggle announcement status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update announcement status',
        });
    }
};

// @desc    Reorder announcements
// @route   PATCH /api/admin/announcements/reorder
// @access  Private/Admin
exports.reorderAnnouncements = async(req, res) => {
    try {
        const { announcementIds } = req.body;

        if (!Array.isArray(announcementIds) || announcementIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide announcement IDs array',
            });
        }

        // Update priority for each announcement
        const updatePromises = announcementIds.map((id, index) =>
            Announcement.findByIdAndUpdate(id, { priority: index + 1 }, { new: true })
        );

        await Promise.all(updatePromises);

        // Fetch updated announcements
        const announcements = await Announcement.find().sort({ priority: 1 });

        res.json({
            success: true,
            message: 'Announcements reordered successfully',
            data: announcements,
        });
    } catch (error) {
        console.error('Reorder announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder announcements',
        });
    }
};