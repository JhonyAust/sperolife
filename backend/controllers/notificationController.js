const Notification = require('../models/Notification');
const { broadcastUnreadCount } = require('../routes/notificationSSE');

// @desc    Get all notifications (Admin)
// @route   GET /api/notifications
// @access  Private/Admin
exports.getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;

    const query = {};
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber totalAmount');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private/Admin
exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.countDocuments({ isRead: false });

    // 🔥 Broadcast updated unread count via SSE
    broadcastUnreadCount();

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
      unreadCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead();

    // 🔥 Broadcast updated unread count via SSE
    broadcastUnreadCount();

    res.json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // 🔥 Broadcast updated unread count via SSE
    broadcastUnreadCount();

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private/Admin
exports.clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ isRead: true });

    res.json({
      success: true,
      message: 'All read notifications cleared'
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
};