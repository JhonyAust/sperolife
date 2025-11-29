// backend/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const {
    getActiveAnnouncements,
    getAnnouncementById,
} = require('../controllers/announcementController');

// Public routes
router.get('/', getActiveAnnouncements);
router.get('/:id', getAnnouncementById);

module.exports = router;