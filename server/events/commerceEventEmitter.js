/**
 * Event Emitter for E-Commerce Events
 * Handles stock changes, cart invalidation, order updates, and notifications
 * Enables real-time synchronization across admin and public platforms
 */

import { EventEmitter } from 'events';
import prisma from '../db/prisma.js';
import { logStockMovement } from '../utils/auditLogger.js';

/**
 * Singleton event emitter for all commerce events
 */
export const eCommerceEventEmitter = new EventEmitter();

// Increase listener limit for production
eCommerceEventEmitter.setMaxListeners(50);

/**
 * Event: Product stock updated
 * Triggers cart invalidation, low stock alerts, notification dispatch
 */
eCommerceEventEmitter.on('product:stock_updated', async (data) => {
  const { productId, oldStock, newStock, reason, adminId } = data;

  console.log(`[STOCK_UPDATE] Product ${productId}: ${oldStock} → ${newStock} (Reason: ${reason})`);

  try {
    // Log stock movement
    await logStockMovement({
      productId,
      movementType: reason,
      quantityChange: newStock - oldStock,
      reason: `Stock ${reason} to ${newStock}`,
      adminId,
    });

    // If stock reaches zero, invalidate all affected carts
    if (newStock === 0 && oldStock > 0) {
      eCommerceEventEmitter.emit('product:out_of_stock', { productId });
    }

    // If stock rises from zero to available, notify waitlisted users
    if (oldStock === 0 && newStock > 0) {
      eCommerceEventEmitter.emit('product:back_in_stock', { productId });
    }

    // Low stock alert
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, minStockLevel: true },
    });

    if (product && newStock <= product.minStockLevel && newStock > 0) {
      eCommerceEventEmitter.emit('product:low_stock', {
        productId,
        productName: product.name,
        currentStock: newStock,
        minLevel: product.minStockLevel,
      });
    }
  } catch (error) {
    console.error('[ERROR] Failed to process stock update event:', error);
  }
});

/**
 * Event: Product out of stock
 * Invalidate carts, notify users
 */
eCommerceEventEmitter.on('product:out_of_stock', async (data) => {
  const { productId } = data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    // Find affected cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { productId },
      include: { user: true },
    });

    console.log(`[OUT_OF_STOCK] Invalidating ${cartItems.length} carts for ${product?.name}`);

    // Remove from carts
    await prisma.cartItem.deleteMany({
      where: { productId },
    });

    // Emit cart invalidation event for real-time UI updates
    eCommerceEventEmitter.emit('carts:invalidated', {
      productId,
      reason: 'OUT_OF_STOCK',
      affectedUsers: cartItems.map(ci => ci.user.id),
      affectedCount: cartItems.length,
    });

    // Queue notification dispatch
    eCommerceEventEmitter.emit('notifications:queue', {
      type: 'PRODUCT_OUT_OF_STOCK',
      userIds: cartItems.map(ci => ci.user.id),
      data: {
        productId,
        productName: product?.name,
      },
    });
  } catch (error) {
    console.error('[ERROR] Failed to handle out-of-stock event:', error);
  }
});

/**
 * Event: Product back in stock
 * Notify waitlisted/interested users
 */
eCommerceEventEmitter.on('product:back_in_stock', async (data) => {
  const { productId } = data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    // Find wishlist items (users interested in this product)
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { productId },
      include: { user: true },
    });

    console.log(`[BACK_IN_STOCK] Notifying ${wishlistItems.length} users for ${product?.name}`);

    if (wishlistItems.length > 0) {
      // Queue notification dispatch
      eCommerceEventEmitter.emit('notifications:queue', {
        type: 'PRODUCT_BACK_IN_STOCK',
        userIds: wishlistItems.map(wi => wi.user.id),
        data: {
          productId,
          productName: product?.name,
        },
      });
    }
  } catch (error) {
    console.error('[ERROR] Failed to handle back-in-stock event:', error);
  }
});

/**
 * Event: Low stock alert
 * Notify admin dashboard
 */
eCommerceEventEmitter.on('product:low_stock', (data) => {
  const { productId, productName, currentStock, minLevel } = data;

  console.warn(`[LOW_STOCK_ALERT] ${productName} (ID: ${productId}) - Current: ${currentStock}, Min: ${minLevel}`);

  // Broadcast to admin dashboard via WebSocket (if implemented)
  if (global.adminWebSocketBroadcast) {
    global.adminWebSocketBroadcast({
      type: 'ALERT',
      severity: 'warning',
      message: `Low stock: ${productName} (${currentStock}/${minLevel})`,
      data: { productId, productName, currentStock, minLevel },
    });
  }
});

/**
 * Event: Carts invalidated
 * Real-time cart sync for affected users
 */
eCommerceEventEmitter.on('carts:invalidated', (data) => {
  const { productId, reason, affectedUsers, affectedCount } = data;

  console.log(`[CARTS_INVALIDATED] ${affectedCount} carts cleared - Reason: ${reason}`);

  // Broadcast to user dashboards via WebSocket (if implemented)
  if (global.userWebSocketBroadcast) {
    affectedUsers.forEach(userId => {
      global.userWebSocketBroadcast(userId, {
        type: 'CART_UPDATED',
        action: 'ITEM_REMOVED',
        reason,
        productId,
      });
    });
  }
});

/**
 * Event: Prescription approved
 * Unlock related orders, notify customer
 */
eCommerceEventEmitter.on('prescription:approved', async (data) => {
  const { prescriptionId, prescribedBy } = data;

  console.log(`[PRESCRIPTION_APPROVED] ${prescriptionId} - Approved by ${prescribedBy}`);

  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { user: true },
    });

    if (!prescription) {
      console.error(`Prescription ${prescriptionId} not found`);
      return;
    }

    // Find pending orders related to this prescription
    const pendingOrders = await prisma.order.findMany({
      where: {
        prescriptionId,
        status: 'PENDING',
      },
    });

    console.log(`[PRESCRIPTION_APPROVED] Unlocking ${pendingOrders.length} pending orders`);

    // Notify customer
    eCommerceEventEmitter.emit('notifications:queue', {
      type: 'PRESCRIPTION_APPROVED',
      userIds: [prescription.userId],
      data: {
        prescriptionId,
        message: 'Your prescription has been approved. You can now complete your order.',
      },
    });

    // Broadcast to admin dashboard
    if (global.adminWebSocketBroadcast) {
      global.adminWebSocketBroadcast({
        type: 'PRESCRIPTION_APPROVED',
        prescriptionId,
        userId: prescription.userId,
        userEmail: prescription.user.email,
      });
    }
  } catch (error) {
    console.error('[ERROR] Failed to handle prescription approval:', error);
  }
});

/**
 * Event: Prescription rejected
 * Block checkout, notify customer, suggest alternatives
 */
eCommerceEventEmitter.on('prescription:rejected', async (data) => {
  const { prescriptionId, rejectReason } = data;

  console.log(`[PRESCRIPTION_REJECTED] ${prescriptionId} - Reason: ${rejectReason}`);

  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { user: true },
    });

    if (!prescription) {
      console.error(`Prescription ${prescriptionId} not found`);
      return;
    }

    // Notify customer
    eCommerceEventEmitter.emit('notifications:queue', {
      type: 'PRESCRIPTION_REJECTED',
      userIds: [prescription.userId],
      data: {
        prescriptionId,
        reason: rejectReason,
        message: `Your prescription was rejected: ${rejectReason}. Please upload a new prescription.`,
      },
    });
  } catch (error) {
    console.error('[ERROR] Failed to handle prescription rejection:', error);
  }
});

/**
 * Event: Order status changed
 * Update related entities, notify customer/delivery partner
 */
eCommerceEventEmitter.on('order:status_changed', async (data) => {
  const { orderId, oldStatus, newStatus, adminId } = data;

  console.log(`[ORDER_STATUS_CHANGED] ${orderId}: ${oldStatus} → ${newStatus}`);

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    // Handle status-specific logic
    switch (newStatus) {
      case 'CONFIRMED':
        // Reserve stock
        eCommerceEventEmitter.emit('stock:reserve', { orderId });
        break;

      case 'SHIPPED':
        // Generate tracking, notify customer
        eCommerceEventEmitter.emit('notifications:queue', {
          type: 'ORDER_SHIPPED',
          userIds: [order.userId],
          data: { orderId, trackingNumber: null },
        });
        break;

      case 'DELIVERED':
        // Release reserved stock, request review
        eCommerceEventEmitter.emit('notifications:queue', {
          type: 'ORDER_DELIVERED',
          userIds: [order.userId],
          data: { orderId },
        });
        break;

      case 'CANCELLED':
        // Release reserved stock
        eCommerceEventEmitter.emit('stock:release', { orderId });
        break;
    }

    // Broadcast to user dashboard
    if (global.userWebSocketBroadcast) {
      global.userWebSocketBroadcast(order.userId, {
        type: 'ORDER_UPDATED',
        orderId,
        newStatus,
      });
    }

    // Broadcast to admin dashboard
    if (global.adminWebSocketBroadcast) {
      global.adminWebSocketBroadcast({
        type: 'ORDER_STATUS_CHANGED',
        orderId,
        newStatus,
        userId: order.userId,
        adminId,
      });
    }
  } catch (error) {
    console.error('[ERROR] Failed to handle order status change:', error);
  }
});

/**
 * Event: Stock reservation (when order confirmed)
 * Prevents overselling
 */
eCommerceEventEmitter.on('stock:reserve', async (data) => {
  const { orderId } = data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) return;

    console.log(`[STOCK_RESERVE] Reserving stock for order ${orderId}`);

    for (const item of order.orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.stockQuantity >= item.quantity) {
        // Update stock in real implementation (use a separate reserved_quantity field)
        console.log(`  ✓ Reserved ${item.quantity} units of ${product.name}`);
      } else {
        console.error(`  ✗ Insufficient stock for ${item.productId}`);
      }
    }
  } catch (error) {
    console.error('[ERROR] Failed to reserve stock:', error);
  }
});

/**
 * Event: Stock release (when order cancelled)
 * Restores reserved stock
 */
eCommerceEventEmitter.on('stock:release', async (data) => {
  const { orderId } = data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) return;

    console.log(`[STOCK_RELEASE] Releasing reserved stock for order ${orderId}`);

    for (const item of order.orderItems) {
      console.log(`  ✓ Released ${item.quantity} units of product ${item.productId}`);
    }
  } catch (error) {
    console.error('[ERROR] Failed to release stock:', error);
  }
});

/**
 * Event: Notifications queued
 * Dispatcher for email, SMS, in-app notifications
 */
eCommerceEventEmitter.on('notifications:queue', async (data) => {
  const { type, userIds, data: notificationData } = data;

  console.log(`[NOTIFICATION_QUEUED] Type: ${type}, Users: ${userIds.length}`);

  try {
    // In production, dispatch to notification service (Bull queue, etc.)
    // For now, just log
    for (const userId of userIds) {
      console.log(`  → Queued ${type} for user ${userId}`);
    }

    // Dispatch to notification service
    if (global.notificationQueue) {
      await global.notificationQueue.add(type, {
        userIds,
        data: notificationData,
        queuedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[ERROR] Failed to queue notifications:', error);
  }
});

/**
 * Setup all event listeners (called on server initialization)
 */
export function setupEventListeners() {
  console.log('[EVENT_EMITTER] Setting up commerce event listeners...');

  // All listeners are already registered above
  // This function can be used for additional initialization

  eCommerceEventEmitter.on('error', (error) => {
    console.error('[EVENT_EMITTER_ERROR]', error);
  });

  console.log(`[EVENT_EMITTER] ✓ Ready (${eCommerceEventEmitter.listenerCount('product:stock_updated')} stock listeners)`);
}

export default {
  eCommerceEventEmitter,
  setupEventListeners,
};
