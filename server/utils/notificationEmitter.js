// ============================================
// Notification Event Emitter
// Handles real-time notification delivery via WebSocket/SSE
// Integrates with Socket.IO for real-time updates
// ============================================

import EventEmitter from 'events';

export class NotificationEmitter extends EventEmitter {
  constructor() {
    super();
    this.maxListeners = 100; // Higher limit for concurrent users
    this.userConnections = new Map(); // userId -> Set of socket IDs
    this.socketToUser = new Map(); // socketId -> userId
  }

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  /**
   * Register a user socket connection
   * @param {string} userId - User ID
   * @param {string} socketId - Socket ID
   */
  registerConnection(userId, socketId) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    
    this.userConnections.get(userId).add(socketId);
    this.socketToUser.set(socketId, userId);
    
    console.log(`[NotificationEmitter] User ${userId} connected (socket: ${socketId})`);
    this.emit('connection', { userId, socketId });
  }

  /**
   * Unregister a user socket connection
   * @param {string} socketId - Socket ID
   */
  unregisterConnection(socketId) {
    const userId = this.socketToUser.get(socketId);
    
    if (!userId) return;
    
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(socketId);
      
      // Remove user from map if no more connections
      if (connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
    
    this.socketToUser.delete(socketId);
    
    console.log(`[NotificationEmitter] User ${userId} disconnected (socket: ${socketId})`);
    this.emit('disconnection', { userId, socketId });
  }

  /**
   * Check if user is connected
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  isUserConnected(userId) {
    return this.userConnections.has(userId) && this.userConnections.get(userId).size > 0;
  }

  /**
   * Get all socket IDs for a user
   * @param {string} userId - User ID
   * @returns {string[]} Socket IDs
   */
  getUserSockets(userId) {
    const sockets = this.userConnections.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  // ============================================
  // NOTIFICATION DELIVERY
  // ============================================

  /**
   * Send notification to a specific user
   * @param {string} userId - User ID
   * @param {object} notification - Notification object
   * @param {object} io - Socket.IO instance
   */
  notifyUser(userId, notification, io) {
    const sockets = this.getUserSockets(userId);
    
    if (sockets.length === 0) {
      console.log(`[NotificationEmitter] User ${userId} not connected, storing for next login`);
      return false;
    }
    
    sockets.forEach(socketId => {
      io.to(socketId).emit('notification', {
        ...notification,
        receivedAt: new Date(),
      });
    });
    
    console.log(`[NotificationEmitter] Sent notification to ${userId} (${sockets.length} socket(s))`);
    return true;
  }

  /**
   * Send notification to multiple users
   * @param {string[]} userIds - Array of user IDs
   * @param {object} notification - Notification object
   * @param {object} io - Socket.IO instance
   */
  notifyUsers(userIds, notification, io) {
    let count = 0;
    
    userIds.forEach(userId => {
      if (this.notifyUser(userId, notification, io)) {
        count++;
      }
    });
    
    console.log(`[NotificationEmitter] Sent notification to ${count}/${userIds.length} users`);
    return count;
  }

  /**
   * Send notification to all admins
   * @param {object} notification - Notification object
   * @param {object} io - Socket.IO instance
   */
  notifyAdmins(notification, io) {
    // This would require tracking admin users separately
    // For now, emit to a special 'admin' room
    io.to('admin-room').emit('admin-notification', {
      ...notification,
      receivedAt: new Date(),
    });
    
    console.log('[NotificationEmitter] Sent notification to all admins');
  }

  // ============================================
  // BROADCAST OPERATIONS
  // ============================================

  /**
   * Broadcast unread count update to a user
   * @param {string} userId - User ID
   * @param {number} unreadCount - Unread count
   * @param {object} io - Socket.IO instance
   */
  broadcastUnreadCount(userId, unreadCount, io) {
    const sockets = this.getUserSockets(userId);
    
    sockets.forEach(socketId => {
      io.to(socketId).emit('unread-count-updated', {
        userId,
        unreadCount,
        updatedAt: new Date(),
      });
    });
  }

  /**
   * Broadcast notification badge update
   * @param {string} userId - User ID
   * @param {object} counts - Count by type
   * @param {object} io - Socket.IO instance
   */
  broadcastUnreadByType(userId, counts, io) {
    const sockets = this.getUserSockets(userId);
    
    sockets.forEach(socketId => {
      io.to(socketId).emit('unread-by-type-updated', {
        userId,
        counts,
        updatedAt: new Date(),
      });
    });
  }

  /**
   * Broadcast to all connected users (e.g., system announcement)
   * @param {object} notification - Notification object
   * @param {object} io - Socket.IO instance
   */
  broadcastToAll(notification, io) {
    io.emit('broadcast-notification', {
      ...notification,
      receivedAt: new Date(),
    });
    
    console.log('[NotificationEmitter] Broadcast notification to all users');
  }

  // ============================================
  // STATS & MONITORING
  // ============================================

  /**
   * Get connection statistics
   * @returns {object} Statistics
   */
  getStats() {
    let totalConnections = 0;
    let totalUsers = 0;
    const connectionsByUser = {};
    
    this.userConnections.forEach((sockets, userId) => {
      totalUsers++;
      totalConnections += sockets.size;
      connectionsByUser[userId] = sockets.size;
    });
    
    return {
      totalConnections,
      totalUsers,
      avgConnectionsPerUser: totalUsers > 0 ? (totalConnections / totalUsers).toFixed(2) : 0,
      connectionsByUser,
    };
  }

  /**
   * Get list of all connected users
   * @returns {string[]} User IDs
   */
  getConnectedUsers() {
    return Array.from(this.userConnections.keys());
  }

  /**
   * Clear all connections (useful for cleanup/restart)
   */
  clearAllConnections() {
    this.userConnections.clear();
    this.socketToUser.clear();
    console.log('[NotificationEmitter] All connections cleared');
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const notificationEmitter = new NotificationEmitter();

export default notificationEmitter;
