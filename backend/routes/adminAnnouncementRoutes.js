// backend/routes/adminAnnouncementRoutes.js
const express = require('express');
const router = express.Router();
const {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementStats,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus,
    reorderAnnouncements,
} = require('../controllers/adminAnnouncementController');

const { protect, admin } = require('../middleware/auth');

// Apply authentication and admin check to all routes
router.use(protect, admin);

// Announcement CRUD
router.post('/', createAnnouncement);
router.get('/', getAllAnnouncements);
router.get('/stats', getAnnouncementStats);
router.get('/:id', getAnnouncementById);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

// Announcement operations
router.patch('/:id/toggle-status', toggleAnnouncementStatus);
router.patch('/reorder', reorderAnnouncements);

module.exports = router;