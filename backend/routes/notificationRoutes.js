const express = require('express');
const router = express.Router();
const {
    getAllNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications
} = require('../controllers/notificationController');

// All routes are admin-only (add authentication middleware as needed)
router.get('/', getAllNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/clear-read', clearReadNotifications);

module.exports = router;