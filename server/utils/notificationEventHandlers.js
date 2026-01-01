// ============================================
// Notification Event Handlers
// Integration with order, prescription, and inventory workflows
// Triggered by business logic events
// ============================================

import { eCommerceEventEmitter } from '../events/commerceEventEmitter.js';
import { integrityEvents } from '../db/integrityMiddleware.js';
import {
  createNotification,
  createBulkNotifications,
  NotificationType,
} from '../utils/notificationManager.js';
import { prisma } from '../db/prisma.js';

// ============================================
// ORDER WORKFLOW NOTIFICATIONS
// ============================================

/**
 * Setup order event listeners for notifications
 */
export async function setupOrderNotifications() {
  // Order confirmed - notify customer
  eCommerceEventEmitter.on('order:status_changed', async (data) => {
    if (data.newStatus === 'CONFIRMED') {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { userId: true, orderNumber: true, deliveryDate: true },
      });

      if (order) {
        await createNotification(order.userId, NotificationType.ORDER_CONFIRMED, {
          orderId: data.orderId,
          orderNumber: order.orderNumber,
          estimatedDelivery: order.deliveryDate
            ? new Date(order.deliveryDate).toLocaleDateString()
            : 'Soon',
        });
      }
    }

    // Order shipped - notify customer
    if (data.newStatus === 'SHIPPED') {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { userId: true, orderNumber: true },
      });

      if (order) {
        await createNotification(order.userId, NotificationType.ORDER_SHIPPED, {
          orderId: data.orderId,
          orderNumber: order.orderNumber,
        });
      }
    }

    // Order delivered - notify customer
    if (data.newStatus === 'DELIVERED') {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { userId: true, orderNumber: true },
      });

      if (order) {
        await createNotification(order.userId, NotificationType.ORDER_DELIVERED, {
          orderId: data.orderId,
          orderNumber: order.orderNumber,
        });
      }
    }

    // Order cancelled - notify customer
    if (data.newStatus === 'CANCELLED') {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { userId: true, orderNumber: true },
      });

      if (order) {
        await createNotification(order.userId, NotificationType.ORDER_CANCELLED, {
          orderId: data.orderId,
          orderNumber: order.orderNumber,
        });
      }
    }
  });

  // New order placed - notify all admins
  eCommerceEventEmitter.on('order:created', async (data) => {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'PHARMACIST'] },
        isActive: true,
      },
      select: { id: true, email: true },
    });

    const adminIds = admins.map(a => a.id);

    // Get order details for notification
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      select: {
        orderNumber: true,
        totalAmount: true,
        user: { select: { phone: true } },
      },
    });

    if (order) {
      await createBulkNotifications(adminIds, NotificationType.NEW_ORDER_PLACED, {
        orderId: data.orderId,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        customerPhone: order.user?.phone || 'Unknown',
      });
    }
  });

  console.log('[NotificationEvents] Order notifications setup complete');
}

// ============================================
// PRESCRIPTION WORKFLOW NOTIFICATIONS
// ============================================

/**
 * Setup prescription event listeners for notifications
 */
export async function setupPrescriptionNotifications() {
  // Prescription uploaded - notify admins
  eCommerceEventEmitter.on('prescription:uploaded', async (data) => {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'PHARMACIST'] },
        isActive: true,
      },
      select: { id: true },
    });

    const adminIds = admins.map(a => a.id);

    const prescription = await prisma.prescription.findUnique({
      where: { id: data.prescriptionId },
      select: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (prescription && adminIds.length > 0) {
      await createBulkNotifications(adminIds, NotificationType.NEW_PRESCRIPTION_UPLOADED, {
        prescriptionId: data.prescriptionId,
        customerName: `${prescription.user?.firstName || ''} ${prescription.user?.lastName || ''}`.trim(),
        orderNumber: data.orderNumber || 'N/A',
      });
    }
  });

  // Prescription approved - notify customer
  eCommerceEventEmitter.on('prescription:approved', async (data) => {
    const prescription = await prisma.prescription.findUnique({
      where: { id: data.prescriptionId },
      select: { userId: true },
    });

    if (prescription) {
      await createNotification(prescription.userId, NotificationType.PRESCRIPTION_APPROVED, {
        prescriptionId: data.prescriptionId,
        orderId: data.orderId || '',
      });
    }
  });

  // Prescription rejected - notify customer
  eCommerceEventEmitter.on('prescription:rejected', async (data) => {
    const prescription = await prisma.prescription.findUnique({
      where: { id: data.prescriptionId },
      select: { userId: true },
    });

    if (prescription) {
      await createNotification(prescription.userId, NotificationType.PRESCRIPTION_REJECTED, {
        prescriptionId: data.prescriptionId,
        reason: data.reason || 'Invalid prescription',
      });
    }
  });

  console.log('[NotificationEvents] Prescription notifications setup complete');
}

// ============================================
// INVENTORY & STOCK NOTIFICATIONS
// ============================================

/**
 * Setup inventory event listeners for notifications
 */
export async function setupInventoryNotifications() {
  // Product back in stock - notify wishlist users
  eCommerceEventEmitter.on('product:back_in_stock', async (data) => {
    // Get all users with this product in wishlist
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { productId: data.productId },
      select: { userId: true },
    });

    const userIds = wishlistItems.map(w => w.userId);

    if (userIds.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { name: true },
      });

      if (product) {
        await createBulkNotifications(userIds, NotificationType.PRODUCT_BACK_IN_STOCK, {
          productId: data.productId,
          productName: product.name,
        });
      }
    }
  });

  // Low stock alert - notify admins
  eCommerceEventEmitter.on('product:low_stock', async (data) => {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'PHARMACIST'] },
        isActive: true,
      },
      select: { id: true },
    });

    const adminIds = admins.map(a => a.id);

    if (adminIds.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { name: true, stockQuantity: true },
      });

      if (product) {
        await createBulkNotifications(adminIds, NotificationType.LOW_STOCK_ALERT, {
          productId: data.productId,
          productName: product.name,
          currentStock: product.stockQuantity,
        });
      }
    }
  });

  // Product out of stock - notify admins
  eCommerceEventEmitter.on('product:out_of_stock', async (data) => {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'PHARMACIST'] },
        isActive: true,
      },
      select: { id: true },
    });

    const adminIds = admins.map(a => a.id);

    if (adminIds.length > 0) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { name: true },
      });

      if (product) {
        await createBulkNotifications(adminIds, NotificationType.INVENTORY_ISSUE, {
          issue: '🚨 Product out of stock',
          details: `${product.name} is now out of stock`,
        });
      }
    }
  });

  console.log('[NotificationEvents] Inventory notifications setup complete');
}

// ============================================
// PAYMENT NOTIFICATIONS
// ============================================

/**
 * Setup payment event listeners for notifications
 */
export async function setupPaymentNotifications() {
  // Payment received - notify customer
  eCommerceEventEmitter.on('payment:received', async (data) => {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      select: { userId: true, orderNumber: true, totalAmount: true },
    });

    if (order) {
      await createNotification(order.userId, NotificationType.PAYMENT_RECEIVED, {
        orderId: data.orderId,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
      });
    }
  });

  // Payment failed - notify customer
  eCommerceEventEmitter.on('payment:failed', async (data) => {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      select: { userId: true, orderNumber: true },
    });

    if (order) {
      await createNotification(order.userId, NotificationType.PAYMENT_FAILED, {
        orderId: data.orderId,
        orderNumber: order.orderNumber,
      });
    }
  });

  // Payment pending - notify admins
  eCommerceEventEmitter.on('payment:pending', async (data) => {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'PHARMACIST'] },
        isActive: true,
      },
      select: { id: true },
    });

    const adminIds = admins.map(a => a.id);

    if (adminIds.length > 0) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
        select: { orderNumber: true, user: { select: { phone: true } } },
      });

      if (order) {
        await createBulkNotifications(adminIds, NotificationType.PAYMENT_PENDING, {
          orderId: data.orderId,
          orderNumber: order.orderNumber,
          customerPhone: order.user?.phone || 'Unknown',
        });
      }
    }
  });

  console.log('[NotificationEvents] Payment notifications setup complete');
}

// ============================================
// REVIEW NOTIFICATIONS
// ============================================

/**
 * Setup review event listeners for notifications
 */
export async function setupReviewNotifications() {
  // New review submitted - notify admins
  eCommerceEventEmitter.on('review:submitted', async (data) => {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'PHARMACIST'] },
        isActive: true,
      },
      select: { id: true },
    });

    const adminIds = admins.map(a => a.id);

    if (adminIds.length > 0) {
      const review = await prisma.review.findUnique({
        where: { id: data.reviewId },
        select: {
          rating: true,
          user: { select: { firstName: true, lastName: true } },
          product: { select: { name: true } },
        },
      });

      if (review) {
        await createBulkNotifications(adminIds, NotificationType.NEW_REVIEW_SUBMITTED, {
          reviewId: data.reviewId,
          productId: data.productId,
          customerName: `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim(),
          productName: review.product?.name || 'Unknown',
          rating: review.rating,
        });
      }
    }
  });

  console.log('[NotificationEvents] Review notifications setup complete');
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Setup all notification event listeners
 * Call this during server startup
 */
export async function setupAllNotificationListeners() {
  try {
    console.log('[NotificationEvents] Setting up all notification listeners...');

    await setupOrderNotifications();
    await setupPrescriptionNotifications();
    await setupInventoryNotifications();
    await setupPaymentNotifications();
    await setupReviewNotifications();

    console.log('[NotificationEvents] ✅ All notification listeners setup complete');
  } catch (error) {
    console.error('[NotificationEvents] Error setting up notification listeners:', error);
  }
}

export default {
  setupOrderNotifications,
  setupPrescriptionNotifications,
  setupInventoryNotifications,
  setupPaymentNotifications,
  setupReviewNotifications,
  setupAllNotificationListeners,
};
