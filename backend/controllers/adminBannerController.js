// backend/controllers/adminBannerController.js
const Banner = require('../models/Banner');
const {
    uploadImageToCloudinary,
    deleteImageFromCloudinary,
    extractPublicId,
} = require('../helpers/cloudinary');

// @desc    Upload banner image
// @route   POST /api/admin/banners/upload-image
// @access  Private/Admin
exports.uploadBannerImage = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        // Upload to Cloudinary with banner-specific dimensions
        // Recommended banner size: 1920x600 for desktop, 16:5 ratio
        const result = await uploadImageToCloudinary(
            req.file.buffer,
            'sperolife/banners', {
                width: 1920,
                height: 600,
                crop: 'fill',
                quality: 'auto:best',
                gravity: 'auto',
            }
        );

        res.json({
            success: true,
            message: 'Banner image uploaded successfully',
            result: {
                url: result.secure_url,
                public_id: result.public_id,
                secure_url: result.secure_url,
            },
        });
    } catch (error) {
        console.error('Upload banner image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload banner image',
            error: error.message,
        });
    }
};

// @desc    Create new banner
// @route   POST /api/admin/banners
// @access  Private/Admin
exports.createBanner = async(req, res) => {
    try {
        const {
            title,
            subtitle,
            description,
            image,
            link,
            linkText,
            position,
            isActive,
            isMobile,
            startDate,
            endDate,
            backgroundColor,
            textColor,
            buttonColor,
        } = req.body;

        // Validation - Only image is required
        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'Please provide banner image',
            });
        }

        // Get the highest position if not provided
        let bannerPosition = position;
        if (!bannerPosition) {
            const highestBanner = await Banner.findOne().sort({ position: -1 });
            bannerPosition = highestBanner ? highestBanner.position + 1 : 1;
        }

        // Prepare banner data with optional fields
        const bannerData = {
            image,
            position: bannerPosition,
            isActive: isActive !== undefined ? isActive : true,
            isMobile: isMobile !== undefined ? isMobile : true,
            backgroundColor: backgroundColor || '#000000',
            textColor: textColor || '#ffffff',
            buttonColor: buttonColor || '#FD0002',
        };

        // Add optional fields only if provided
        if (title && title.trim()) bannerData.title = title.trim();
        if (subtitle && subtitle.trim()) bannerData.subtitle = subtitle.trim();
        if (description && description.trim()) bannerData.description = description.trim();
        if (link && link.trim()) bannerData.link = link.trim();
        if (linkText && linkText.trim()) bannerData.linkText = linkText.trim();
        if (startDate) bannerData.startDate = startDate;
        if (endDate) bannerData.endDate = endDate;

        const banner = await Banner.create(bannerData);

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: banner,
        });
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create banner',
            error: error.message,
        });
    }
};

// @desc    Get all banners
// @route   GET /api/admin/banners
// @access  Private/Admin
exports.getAllBanners = async(req, res) => {
    try {
        const banners = await Banner.find().sort({ position: 1 });

        res.json({
            success: true,
            data: banners,
        });
    } catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners',
        });
    }
};

// @desc    Get banner statistics
// @route   GET /api/admin/banners/stats
// @access  Private/Admin
exports.getBannerStats = async(req, res) => {
    try {
        const totalBanners = await Banner.countDocuments();
        const activeBanners = await Banner.countDocuments({ isActive: true });
        const inactiveBanners = await Banner.countDocuments({ isActive: false });

        // Count banners with content vs image-only
        const imageOnlyBanners = await Banner.countDocuments({
            $or: [
                { title: { $exists: false } },
                { title: '' }
            ],
            $and: [
                { subtitle: { $in: [null, ''] } },
                { description: { $in: [null, ''] } },
                { link: { $in: [null, ''] } }
            ]
        });

        const contentBanners = totalBanners - imageOnlyBanners;

        // Count scheduled banners (have start/end dates and are currently scheduled)
        const now = new Date();
        const scheduledBanners = await Banner.countDocuments({
            $or: [
                { startDate: { $gt: now } },
                { endDate: { $gt: now } }
            ]
        });

        res.json({
            success: true,
            data: {
                totalBanners,
                activeBanners,
                inactiveBanners,
                scheduledBanners,
                imageOnlyBanners,
                contentBanners,
            },
        });
    } catch (error) {
        console.error('Get banner stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banner statistics',
            error: error.message,
        });
    }
};

// @desc    Get single banner
// @route   GET /api/admin/banners/:id
// @access  Private/Admin
exports.getBannerById = async(req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
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
        });
    }
};

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
exports.updateBanner = async(req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        const {
            title,
            subtitle,
            description,
            image,
            link,
            linkText,
            position,
            isActive,
            isMobile,
            startDate,
            endDate,
            backgroundColor,
            textColor,
            buttonColor,
        } = req.body;

        // Delete old image if new image is provided
        if (image && image !== banner.image) {
            const oldPublicId = extractPublicId(banner.image);
            if (oldPublicId) {
                await deleteImageFromCloudinary(oldPublicId);
            }
            banner.image = image;
        }

        // Update optional text fields - remove if empty
        if (title !== undefined) {
            banner.title = title.trim() || undefined;
        }
        if (subtitle !== undefined) {
            banner.subtitle = subtitle.trim() || undefined;
        }
        if (description !== undefined) {
            banner.description = description.trim() || undefined;
        }
        if (link !== undefined) {
            banner.link = link.trim() || undefined;
        }
        if (linkText !== undefined) {
            banner.linkText = linkText.trim() || undefined;
        }

        // Update other fields
        if (position !== undefined) banner.position = position;
        if (typeof isActive === 'boolean') banner.isActive = isActive;
        if (typeof isMobile === 'boolean') banner.isMobile = isMobile;
        if (startDate !== undefined) banner.startDate = startDate || undefined;
        if (endDate !== undefined) banner.endDate = endDate || undefined;
        if (backgroundColor) banner.backgroundColor = backgroundColor;
        if (textColor) banner.textColor = textColor;
        if (buttonColor) banner.buttonColor = buttonColor;

        await banner.save();

        res.json({
            success: true,
            message: 'Banner updated successfully',
            data: banner,
        });
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update banner',
            error: error.message,
        });
    }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async(req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        // Delete image from Cloudinary
        if (banner.image) {
            const publicId = extractPublicId(banner.image);
            if (publicId) {
                await deleteImageFromCloudinary(publicId);
            }
        }

        await banner.deleteOne();

        res.json({
            success: true,
            message: 'Banner deleted successfully',
        });
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete banner',
        });
    }
};

// @desc    Toggle banner status
// @route   PATCH /api/admin/banners/:id/toggle-status
// @access  Private/Admin
exports.toggleBannerStatus = async(req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({
            success: true,
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
            data: banner,
        });
    } catch (error) {
        console.error('Toggle banner status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update banner status',
        });
    }
};

// @desc    Reorder banners
// @route   PATCH /api/admin/banners/reorder
// @access  Private/Admin
exports.reorderBanners = async(req, res) => {
    try {
        const { bannerIds } = req.body;

        if (!Array.isArray(bannerIds) || bannerIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide banner IDs array',
            });
        }

        // Update position for each banner
        const updatePromises = bannerIds.map((id, index) =>
            Banner.findByIdAndUpdate(id, { position: index + 1 }, { new: true })
        );

        await Promise.all(updatePromises);

        // Fetch updated banners
        const banners = await Banner.find().sort({ position: 1 });

        res.json({
            success: true,
            message: 'Banners reordered successfully',
            data: banners,
        });
    } catch (error) {
        console.error('Reorder banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reorder banners',
        });
    }
};