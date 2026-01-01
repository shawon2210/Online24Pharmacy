// ============================================
// Notification Routes
// Handles notification CRUD operations
// ============================================

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  getUnreadCountByType,
  searchNotifications,
  getAdminUnreadNotifications,
  getNotificationStats,
} from '../utils/notificationManager.js';

const router = express.Router();

// ============================================
// MIDDLEWARE
// ============================================

// Require authentication for all notification routes
router.use(authenticateToken);

// ============================================
// GET NOTIFICATIONS
// ============================================

/**
 * GET /api/notifications
 * Get paginated user notifications
 * Query params: limit, offset, unreadOnly, type
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, unreadOnly = false, type } = req.query;
    
    const result = await getUserNotifications(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true',
      type: type || null,
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * GET /api/notifications/unread-by-type
 * Get unread count breakdown by notification type
 */
router.get('/unread-by-type', async (req, res) => {
  try {
    const userId = req.user.id;
    const counts = await getUnreadCountByType(userId);
    res.json(counts);
  } catch (error) {
    console.error('Error fetching unread counts by type:', error);
    res.status(500).json({ error: 'Failed to fetch unread counts' });
  }
});

/**
 * GET /api/notifications/search
 * Search notifications
 * Query params: q, limit, offset
 */
router.get('/search', async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const result = await searchNotifications(userId, q, {
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error searching notifications:', error);
    res.status(500).json({ error: 'Failed to search notifications' });
  }
});

/**
 * GET /api/notifications/:id
 * Get single notification (for detailed view)
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // For now, return the notification from the list
    // In production, you might want to return more details
    const result = await getUserNotifications(userId, { limit: 1 });
    const notification = result.notifications.find(n => n.id === id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// ============================================
// MARK AS READ
// ============================================

/**
 * POST /api/notifications/:id/read
 * Mark single notification as read
 */
router.post('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verify user owns this notification
    const notification = await getUserNotifications(userId, { limit: 1 });
    const owned = notification.notifications.some(n => n.id === id);
    
    if (!owned) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await markNotificationAsRead(id);
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all user notifications as read
 */
router.post('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await markAllNotificationsAsRead(userId);
    
    res.json({ success: true, count, message: `${count} notifications marked as read` });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// ============================================
// DELETE NOTIFICATIONS
// ============================================

/**
 * DELETE /api/notifications/:id
 * Delete a single notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verify user owns this notification
    const result = await getUserNotifications(userId, { limit: 1 });
    const owned = result.notifications.some(n => n.id === id);
    
    if (!owned) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const success = await deleteNotification(id);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete notification' });
    }
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * GET /api/notifications/admin/unread
 * Get unread admin notifications
 * (only accessible to admin users)
 */
router.get('/admin/unread', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PHARMACIST') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { limit = 10, types } = req.query;
    const typeArray = types ? types.split(',') : [];
    
    const notifications = await getAdminUnreadNotifications({
      limit: parseInt(limit),
      types: typeArray,
    });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ error: 'Failed to fetch admin notifications' });
  }
});

/**
 * GET /api/notifications/admin/stats
 * Get notification statistics for admin dashboard
 */
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PHARMACIST') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stats = await getNotificationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
