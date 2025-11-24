const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Store connected clients
const clients = new Map();

// @desc    SSE endpoint for real-time notifications
// @route   GET /api/notifications/stream
// @access  Private/Admin
router.get('/stream', async(req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering

    // Generate unique client ID
    const clientId = Date.now();

    // Store client connection
    clients.set(clientId, res);

    console.log(`📡 SSE Client connected: ${clientId}. Total clients: ${clients.size}`);

    // Send initial connection success message
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    // Send initial unread count
    try {
        const unreadCount = await Notification.countDocuments({ isRead: false });
        res.write(`data: ${JSON.stringify({ 
      type: 'unread_count', 
      count: unreadCount 
    })}\n\n`);
    } catch (error) {
        console.error('Error sending initial unread count:', error);
    }

    // Keep connection alive with heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
        res.write(`:heartbeat\n\n`);
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(clientId);
        console.log(`📡 SSE Client disconnected: ${clientId}. Total clients: ${clients.size}`);
    });
});

// Function to broadcast notification to all connected clients
const broadcastNotification = (notification) => {
    const message = JSON.stringify({
        type: 'new_notification',
        notification
    });

    console.log(`📢 Broadcasting to ${clients.size} clients:`, notification.title);

    clients.forEach((client, clientId) => {
        try {
            client.write(`data: ${message}\n\n`);
        } catch (error) {
            console.error(`Error sending to client ${clientId}:`, error);
            clients.delete(clientId);
        }
    });
};

// Function to broadcast unread count update
const broadcastUnreadCount = async() => {
    try {
        const unreadCount = await Notification.countDocuments({ isRead: false });
        const message = JSON.stringify({
            type: 'unread_count',
            count: unreadCount
        });

        clients.forEach((client, clientId) => {
            try {
                client.write(`data: ${message}\n\n`);
            } catch (error) {
                console.error(`Error sending unread count to client ${clientId}:`, error);
                clients.delete(clientId);
            }
        });
    } catch (error) {
        console.error('Error broadcasting unread count:', error);
    }
};

// Export functions for use in controllers
module.exports = {
    router,
    broadcastNotification,
    broadcastUnreadCount
};