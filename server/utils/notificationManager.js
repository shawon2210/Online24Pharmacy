// ============================================
// Notification Manager Utility
// Handles creation, retrieval, and cleanup of notifications
// Role-based, DGDA-compliant notification system
// ============================================

import prisma from '../db/prisma.js';
import { getDhakaTimestamp } from './auditLogger.js';

// ============================================
// NOTIFICATION TYPES & TEMPLATES
// ============================================

export const NotificationType = {
  // Customer notifications
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  PRESCRIPTION_APPROVED: 'PRESCRIPTION_APPROVED',
  PRESCRIPTION_REJECTED: 'PRESCRIPTION_REJECTED',
  PRODUCT_BACK_IN_STOCK: 'PRODUCT_BACK_IN_STOCK',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PRESCRIPTION_EXPIRING: 'PRESCRIPTION_EXPIRING',
  
  // Admin notifications
  NEW_PRESCRIPTION_UPLOADED: 'NEW_PRESCRIPTION_UPLOADED',
  LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
  NEW_ORDER_PLACED: 'NEW_ORDER_PLACED',
  NEW_REVIEW_SUBMITTED: 'NEW_REVIEW_SUBMITTED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  INVENTORY_ISSUE: 'INVENTORY_ISSUE',
};

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

const notificationTemplates = {
  [NotificationType.ORDER_CONFIRMED]: {
    title: '✅ Order Confirmed',
    getMessage: (data) => `Your order #${data.orderNumber} is confirmed! Expected delivery: ${data.estimatedDelivery || 'Soon'}`,
    actionUrl: (data) => `/orders/${data.orderId}`,
  },
  
  [NotificationType.ORDER_SHIPPED]: {
    title: '🚚 Order Shipped',
    getMessage: (data) => `Your order #${data.orderNumber} has been shipped. Track it now!`,
    actionUrl: (data) => `/orders/${data.orderId}`,
  },
  
  [NotificationType.ORDER_DELIVERED]: {
    title: '📦 Order Delivered',
    getMessage: (data) => `Your order #${data.orderNumber} has been delivered. Thank you for shopping!`,
    actionUrl: (data) => `/orders/${data.orderId}`,
  },
  
  [NotificationType.ORDER_CANCELLED]: {
    title: '❌ Order Cancelled',
    getMessage: (data) => `Your order #${data.orderNumber} has been cancelled. Refund will be processed soon.`,
    actionUrl: (data) => `/orders/${data.orderId}`,
  },
  
  [NotificationType.PRESCRIPTION_APPROVED]: {
    title: '📋 Prescription Approved',
    getMessage: (_data) => `Your prescription has been approved! You can now proceed with your order.`,
    actionUrl: (data) => `/orders/${data.orderId || ''}`,
  },
  
  [NotificationType.PRESCRIPTION_REJECTED]: {
    title: '⚠️ Prescription Rejected',
    getMessage: (data) => `Your prescription was rejected. Reason: ${data.reason || 'Please upload a valid prescription'}. Upload again.`,
    actionUrl: (_data) => `/upload-prescription`,
  },
  
  [NotificationType.PRODUCT_BACK_IN_STOCK]: {
    title: '🔔 Product Back in Stock',
    getMessage: (data) => `${data.productName} is back in stock! Add it to your cart now.`,
    actionUrl: (data) => `/product/${data.productId}`,
  },
  
  [NotificationType.PAYMENT_RECEIVED]: {
    title: '✅ Payment Received',
    getMessage: (data) => `Payment of ৳${data.amount} for order #${data.orderNumber} has been received.`,
    actionUrl: (data) => `/orders/${data.orderId}`,
  },
  
  [NotificationType.PAYMENT_FAILED]: {
    title: '❌ Payment Failed',
    getMessage: (data) => `Payment for order #${data.orderNumber} failed. Please try again.`,
    actionUrl: (data) => `/orders/${data.orderId}`,
  },
  
  [NotificationType.PRESCRIPTION_EXPIRING]: {
    title: '⏰ Prescription Expiring Soon',
    getMessage: (data) => `Your prescription expires on ${data.expiryDate}. Upload a new one soon!`,
    actionUrl: (_data) => `/upload-prescription`,
  },
  
  // Admin notifications
  [NotificationType.NEW_PRESCRIPTION_UPLOADED]: {
    title: '📄 New Prescription Uploaded',
    getMessage: (data) => `New prescription from ${data.customerName} (Order #${data.orderNumber})`,
    actionUrl: (data) => `/admin/prescriptions/${data.prescriptionId}`,
  },
  
  [NotificationType.LOW_STOCK_ALERT]: {
    title: '⚠️ Low Stock Alert',
    getMessage: (data) => `${data.productName} stock is low (${data.currentStock} units remaining)`,
    actionUrl: (data) => `/admin/products/${data.productId}`,
  },
  
  [NotificationType.NEW_ORDER_PLACED]: {
    title: '📦 New Order Placed',
    getMessage: (data) => `New order #${data.orderNumber} from ${data.customerPhone}. Total: ৳${data.totalAmount}`,
    actionUrl: (data) => `/admin/orders/${data.orderId}`,
  },
  
  [NotificationType.NEW_REVIEW_SUBMITTED]: {
    title: '⭐ New Review Submitted',
    getMessage: (data) => `${data.customerName} gave ${data.rating}⭐ to ${data.productName}`,
    actionUrl: (data) => `/admin/products/${data.productId}`,
  },
  
  [NotificationType.PAYMENT_PENDING]: {
    title: '💳 Payment Pending',
    getMessage: (data) => `Order #${data.orderNumber} from ${data.customerPhone} awaiting payment`,
    actionUrl: (data) => `/admin/orders/${data.orderId}`,
  },
  
  [NotificationType.INVENTORY_ISSUE]: {
    title: '🚨 Inventory Issue',
    getMessage: (data) => `${data.issue} - Please review: ${data.details}`,
    actionUrl: (_data) => `/admin/products`,
  },
};

// ============================================
// CREATE NOTIFICATION
// ============================================

/**
 * Create a notification for a user
 * @param {string} userId - User ID
 * @param {string} type - Notification type from NotificationType enum
 * @param {object} data - Context data for template rendering
 * @returns {Promise<object>} Created notification
 */
export async function createNotification(userId, type, data = {}) {
  try {
    const template = notificationTemplates[type];
    
    if (!template) {
      console.warn(`Unknown notification type: ${type}`);
      return null;
    }
    
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title: template.title,
        message: template.getMessage(data),
        metadata: JSON.stringify({
          ...data,
          actionUrl: template.actionUrl(data),
          createdAt: getDhakaTimestamp(),
        }),
        isRead: false,
      },
    });
    
    return notification;
  } catch (error) {
    console.error(`Error creating notification (type: ${type}):`, error);
    return null;
  }
}

// ============================================
// BULK CREATE NOTIFICATIONS
// ============================================

/**
 * Create notifications for multiple users (e.g., back in stock alert to all wishlist users)
 * @param {string[]} userIds - Array of user IDs
 * @param {string} type - Notification type
 * @param {object} data - Context data
 * @returns {Promise<number>} Number of notifications created
 */
export async function createBulkNotifications(userIds, type, data = {}) {
  try {
    if (!userIds || userIds.length === 0) return 0;
    
    const template = notificationTemplates[type];
    if (!template) {
      console.warn(`Unknown notification type: ${type}`);
      return 0;
    }
    
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title: template.title,
      message: template.getMessage(data),
      metadata: JSON.stringify({
        ...data,
        actionUrl: template.actionUrl(data),
        createdAt: getDhakaTimestamp(),
      }),
      isRead: false,
    }));
    
    const result = await prisma.notification.createMany({
      data: notifications,
    });
    
    return result.count;
  } catch (error) {
    console.error(`Error creating bulk notifications (type: ${type}):`, error);
    return 0;
  }
}

// ============================================
// GET NOTIFICATIONS
// ============================================

/**
 * Get user notifications with pagination
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<object>} Notifications with metadata
 */
export async function getUserNotifications(userId, options = {}) {
  try {
    const {
      limit = 20,
      offset = 0,
      unreadOnly = false,
      type = null,
    } = options;
    
    const where = { userId };
    if (unreadOnly) where.isRead = false;
    if (type) where.type = type;
    
    const [notifications, unreadCount, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    
    // Parse metadata for each notification
    const parsed = notifications.map(notif => ({
      ...notif,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : {},
    }));
    
    return {
      notifications: parsed,
      unreadCount,
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    return {
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      hasMore: false,
      error: error.message,
    };
  }
}

// ============================================
// MARK AS READ
// ============================================

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<object>} Updated notification
 */
export async function markNotificationAsRead(notificationId) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    return null;
  }
}

/**
 * Mark all user notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of updated notifications
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result.count;
  } catch (error) {
    console.error(`Error marking all notifications as read for user ${userId}:`, error);
    return 0;
  }
}

// ============================================
// DELETE NOTIFICATIONS
// ============================================

/**
 * Delete a single notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} Success flag
 */
export async function deleteNotification(notificationId) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
    return true;
  } catch (error) {
    console.error(`Error deleting notification ${notificationId}:`, error);
    return false;
  }
}

/**
 * Cleanup old notifications (older than 30 days)
 * Run daily via cron job
 * @returns {Promise<number>} Number of deleted notifications
 */
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    
    console.log(`[CRON] Cleanup: Deleted ${result.count} notifications older than 30 days`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    return 0;
  }
}

// ============================================
// GET NOTIFICATION COUNTS
// ============================================

/**
 * Get unread notification count for user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  } catch (error) {
    console.error(`Error getting unread count for user ${userId}:`, error);
    return 0;
  }
}

/**
 * Get unread counts by type for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Count by type
 */
export async function getUnreadCountByType(userId) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      select: { type: true },
    });
    
    const counts = {};
    notifications.forEach(notif => {
      counts[notif.type] = (counts[notif.type] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    console.error(`Error getting unread counts by type for user ${userId}:`, error);
    return {};
  }
}

// ============================================
// SEARCH NOTIFICATIONS
// ============================================

/**
 * Search user notifications
 * @param {string} userId - User ID
 * @param {string} query - Search query
 * @param {object} options - Query options
 * @returns {Promise<object>} Search results
 */
export async function searchNotifications(userId, query, options = {}) {
  try {
    const { limit = 20, offset = 0 } = options;
    
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { message: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    
    const total = await prisma.notification.count({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { message: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    
    const parsed = notifications.map(notif => ({
      ...notif,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : {},
    }));
    
    return {
      notifications: parsed,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error(`Error searching notifications for user ${userId}:`, error);
    return {
      notifications: [],
      total: 0,
      hasMore: false,
      error: error.message,
    };
  }
}

// ============================================
// ADMIN HELPERS
// ============================================

/**
 * Get all unread admin notifications (for admin dashboard)
 * @param {object} options - Filter options
 * @returns {Promise<array>} Unread admin notifications
 */
export async function getAdminUnreadNotifications(options = {}) {
  try {
    const { limit = 10, types = [] } = options;
    
    const where = {
      isRead: false,
      type: {
        in: types.length > 0 ? types : [
          NotificationType.NEW_PRESCRIPTION_UPLOADED,
          NotificationType.LOW_STOCK_ALERT,
          NotificationType.NEW_ORDER_PLACED,
          NotificationType.NEW_REVIEW_SUBMITTED,
          NotificationType.PAYMENT_PENDING,
          NotificationType.INVENTORY_ISSUE,
        ],
      },
    };
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return notifications.map(notif => ({
      ...notif,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : {},
    }));
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return [];
  }
}

/**
 * Get notification statistics for admin dashboard
 * @returns {Promise<object>} Statistics
 */
export async function getNotificationStats() {
  try {
    const totalUnread = await prisma.notification.count({
      where: { isRead: false },
    });
    
    const total = await prisma.notification.count();
    
    const byType = await prisma.notification.groupBy({
      by: ['type'],
      where: { isRead: false },
      _count: {
        id: true,
      },
    });
    
    const typeStats = {};
    byType.forEach(item => {
      typeStats[item.type] = item._count.id;
    });
    
    return {
      totalUnread,
      total,
      byType: typeStats,
      readRate: total > 0 ? ((total - totalUnread) / total * 100).toFixed(2) : 0,
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return {
      totalUnread: 0,
      total: 0,
      byType: {},
      readRate: 0,
    };
  }
}

export default {
  NotificationType,
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  cleanupOldNotifications,
  getUnreadCount,
  getUnreadCountByType,
  searchNotifications,
  getAdminUnreadNotifications,
  getNotificationStats,
};
