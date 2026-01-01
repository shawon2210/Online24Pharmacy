// ============================================
// Socket.IO Real-Time Notification Setup
// Handles WebSocket connections for real-time notifications
// ============================================

import { Server } from 'socket.io';
import { notificationEmitter } from '../utils/notificationEmitter.js';
import {
  createNotification,
  getUnreadCount,
  getUnreadCountByType,
} from '../utils/notificationManager.js';
import { prisma } from '../db/prisma.js';

// ============================================
// SOCKET.IO SERVER SETUP
// ============================================

/**
 * Initialize Socket.IO for real-time notifications
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export function initializeSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e5,
  });

  // ============================================
  // CONNECTION HANDLERS
  // ============================================

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // ============================================
    // AUTHENTICATION
    // ============================================

    /**
     * User joins their notification room
     * Client should emit this after connecting with user ID
     */
    socket.on('user:login', async (data) => {
      try {
        const userId = data.userId;

        if (!userId) {
          socket.emit('error', { message: 'User ID required' });
          return;
        }

        // Register connection
        notificationEmitter.registerConnection(userId, socket.id);

        // Join user-specific room for targeted notifications
        socket.join(`user:${userId}`);

        // Join admin room if user is admin
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user && (user.role === 'ADMIN' || user.role === 'PHARMACIST')) {
          socket.join('admin-room');
          console.log(`[Socket.IO] User ${userId} joined admin-room`);
        }

        // Send initial unread count
        const unreadCount = await getUnreadCount(userId);
        socket.emit('initial-load', {
          unreadCount,
          connectedAt: new Date(),
        });

        console.log(`[Socket.IO] User ${userId} authenticated (socket: ${socket.id})`);
      } catch (error) {
        console.error('[Socket.IO] Error in user:login:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // ============================================
    // NOTIFICATION HANDLERS
    // ============================================

    /**
     * Mark notification as read
     * Updates unread count in real-time
     */
    socket.on('notification:read', async (data) => {
      try {
        const { notificationId, userId } = data;

        if (!userId || !notificationId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Update in database
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });

        // Send updated unread count to user
        const unreadCount = await getUnreadCount(userId);
        io.to(`user:${userId}`).emit('unread-count-updated', {
          unreadCount,
          updatedAt: new Date(),
        });

        console.log(`[Socket.IO] Notification ${notificationId} marked as read`);
      } catch (error) {
        console.error('[Socket.IO] Error in notification:read:', error);
        socket.emit('error', { message: 'Failed to mark as read' });
      }
    });

    /**
     * Mark all notifications as read
     */
    socket.on('notifications:read-all', async (data) => {
      try {
        const userId = data.userId;

        if (!userId) {
          socket.emit('error', { message: 'User ID required' });
          return;
        }

        // Update in database
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });

        // Send updated count
        io.to(`user:${userId}`).emit('unread-count-updated', {
          unreadCount: 0,
          updatedAt: new Date(),
        });

        console.log(`[Socket.IO] All notifications marked as read for user ${userId}`);
      } catch (error) {
        console.error('[Socket.IO] Error in notifications:read-all:', error);
        socket.emit('error', { message: 'Failed to mark all as read' });
      }
    });

    /**
     * Delete a notification
     */
    socket.on('notification:delete', async (data) => {
      try {
        const { notificationId, userId } = data;

        if (!userId || !notificationId) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Delete from database
        await prisma.notification.delete({
          where: { id: notificationId },
        });

        // Send updated unread count
        const unreadCount = await getUnreadCount(userId);
        io.to(`user:${userId}`).emit('unread-count-updated', {
          unreadCount,
          updatedAt: new Date(),
        });

        console.log(`[Socket.IO] Notification ${notificationId} deleted`);
      } catch (error) {
        console.error('[Socket.IO] Error in notification:delete:', error);
        socket.emit('error', { message: 'Failed to delete notification' });
      }
    });

    // ============================================
    // HEALTH CHECK
    // ============================================

    socket.on('ping', () => {
      socket.emit('pong');
    });

    // ============================================
    // DISCONNECTION HANDLER
    // ============================================

    socket.on('disconnect', () => {
      notificationEmitter.unregisterConnection(socket.id);
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });

    // ============================================
    // ERROR HANDLING
    // ============================================

    socket.on('error', (error) => {
      console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
    });
  });

  // ============================================
  // SERVER STATS ENDPOINT
  // ============================================

  /**
   * Admin can request connection statistics
   * Usage: io.emit('stats:request', {adminKey: 'secret'})
   */
  io.on('connection', (socket) => {
    socket.on('stats:request', (data) => {
      if (data?.adminKey === process.env.ADMIN_KEY) {
        const stats = notificationEmitter.getStats();
        socket.emit('stats:response', stats);
      }
    });
  });

  console.log('[Socket.IO] ✅ Server initialized with real-time notifications');

  return io;
}

// ============================================
// HELPER FUNCTIONS FOR SERVER
// ============================================

/**
 * Broadcast notification to a specific user via Socket.IO
 * @param {Server} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {object} notification - Notification object
 */
export function broadcastNotificationToUser(io, userId, notification) {
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    receivedAt: new Date(),
  });

  console.log(`[Broadcast] Notification sent to user ${userId}`);
}

/**
 * Broadcast to all admins
 * @param {Server} io - Socket.IO server instance
 * @param {object} notification - Notification object
 */
export function broadcastToAdmins(io, notification) {
  io.to('admin-room').emit('admin-notification', {
    ...notification,
    receivedAt: new Date(),
  });

  console.log('[Broadcast] Notification sent to all admins');
}

/**
 * Broadcast to all connected users
 * @param {Server} io - Socket.IO server instance
 * @param {object} notification - Notification object
 */
export function broadcastToAll(io, notification) {
  io.emit('broadcast', {
    ...notification,
    receivedAt: new Date(),
  });

  console.log('[Broadcast] Notification sent to all users');
}

/**
 * Update unread count for user across all sockets
 * @param {Server} io - Socket.IO server instance
 * @param {string} userId - User ID
 * @param {number} unreadCount - Unread notification count
 */
export async function updateUnreadCount(io, userId, unreadCount) {
  io.to(`user:${userId}`).emit('unread-count-updated', {
    userId,
    unreadCount,
    updatedAt: new Date(),
  });
}

/**
 * Get connection stats for monitoring
 * @returns {object} Connection statistics
 */
export function getConnectionStats() {
  return notificationEmitter.getStats();
}

export default {
  initializeSocketIO,
  broadcastNotificationToUser,
  broadcastToAdmins,
  broadcastToAll,
  updateUnreadCount,
  getConnectionStats,
};
