/**
 * Integrity Middleware for Prisma
 * Enforces business rules and data constraints at the application level
 * 
 * Rules Enforced:
 * ✓ Products require active categories
 * ✓ Stock must be non-negative
 * ✓ Prices must be positive
 * ✓ Rx-required orders need approved prescriptions
 * ✓ Soft-delete enforcement
 * ✓ Cart invalidation on stock changes
 */

import prisma from './prisma.js';
import { EventEmitter } from 'events';
import { logProductAudit, logStockMovement } from './auditLogger.js';

export const integrityEvents = new EventEmitter();

/**
 * Validate product integrity before create/update
 * @throws {Error} If validation fails
 */
export async function validateProductIntegrity(data) {
  // Validate price is positive
  if (data.price !== undefined && data.price <= 0) {
    throw new Error('Price must be greater than 0');
  }

  // Validate stock is non-negative
  if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
    throw new Error('Stock quantity cannot be negative');
  }

  // Validate max order quantity is positive
  if (data.maxOrderQuantity !== undefined && data.maxOrderQuantity <= 0) {
    throw new Error('Max order quantity must be greater than 0');
  }

  // Validate discount price
  if (data.discountPrice !== undefined && data.price !== undefined) {
    if (data.discountPrice <= 0 || data.discountPrice >= data.price) {
      throw new Error('Discount price must be positive and less than regular price');
    }
  }

  // Validate category exists and is active if provided
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    
    if (!category) {
      throw new Error(`Category with ID ${data.categoryId} not found`);
    }
    
    if (!category.isActive) {
      throw new Error(`Category "${category.name}" is inactive. Cannot assign product to inactive category`);
    }
  }

  // Validate subcategory exists if provided
  if (data.subcategoryId) {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: data.subcategoryId },
    });
    
    if (!subcategory) {
      throw new Error(`Subcategory with ID ${data.subcategoryId} not found`);
    }
    
    if (!subcategory.isActive) {
      throw new Error(`Subcategory is inactive. Cannot assign product to inactive subcategory`);
    }
  }

  return true;
}

/**
 * Validate and process stock update
 * Emits event to invalidate affected carts
 * @throws {Error} If validation fails
 */
export async function updateProductStock(productId, newStockQuantity, reason = 'ADJUSTMENT', adminId = null, orderId = null) {
  if (newStockQuantity < 0) {
    throw new Error('Cannot reduce stock below 0');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  // Calculate quantity change
  const quantityChange = newStockQuantity - product.stockQuantity;

  // Update product stock
  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { stockQuantity: newStockQuantity },
  });

  // Log stock movement
  await logStockMovement({
    productId,
    movementType: reason,
    quantityChange,
    reason: `Stock ${reason === 'SALE' ? 'sold' : 'adjusted'} to ${newStockQuantity}`,
    adminId,
    orderId,
  });

  // If stock went below minimum or to zero, emit event for cart invalidation
  if (newStockQuantity === 0 && product.stockQuantity > 0) {
    integrityEvents.emit('product:out_of_stock', {
      productId,
      productName: product.name,
    });
  }

  if (newStockQuantity < product.minStockLevel) {
    integrityEvents.emit('product:low_stock_alert', {
      productId,
      productName: product.name,
      currentStock: newStockQuantity,
      minLevel: product.minStockLevel,
    });
  }

  return updatedProduct;
}

/**
 * Validate prescription requirement for order
 * @throws {Error} If Rx is required but missing or not approved
 */
export async function validateOrderPrescriptionRequirement(orderItems, prescriptionId = null) {
  // Get all products in order
  const productIds = orderItems.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, requiresPrescription: true },
  });

  // Check if any product requires prescription
  const requiresRx = products.some(p => p.requiresPrescription);

  if (requiresRx) {
    if (!prescriptionId) {
      throw new Error(
        `This order contains prescription-required products. Please upload a valid prescription: ${
          products.filter(p => p.requiresPrescription).map(p => p.name).join(', ')
        }`
      );
    }

    // Validate prescription exists and is approved
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    if (prescription.status !== 'APPROVED') {
      throw new Error(`Prescription is ${prescription.status.toLowerCase()}. Cannot place order with unapproved prescription`);
    }

    if (prescription.expiresAt && new Date() > prescription.expiresAt) {
      throw new Error('Prescription has expired. Please upload a new prescription');
    }

    // Check if prescription belongs to correct user
    if (prescription.userId !== orderItems[0].userId) {
      throw new Error('Prescription does not belong to this user');
    }
  }

  return true;
}

/**
 * Invalidate carts when product becomes unavailable
 */
export async function invalidateProductCarts(productId, reason = 'OUT_OF_STOCK') {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { productId },
      include: { user: true },
    });

    if (cartItems.length > 0) {
      // Remove affected cart items
      await prisma.cartItem.deleteMany({
        where: { productId },
      });

      // Log invalidation
      await prisma.$executeRaw`
        INSERT INTO cart_invalidation_logs (product_id, reason, affected_cart_count, timestamp)
        VALUES (${productId}, ${reason}, ${cartItems.length}, CURRENT_TIMESTAMP)
      `;

      integrityEvents.emit('carts:invalidated', {
        productId,
        reason,
        affectedUserCount: cartItems.length,
        affectedUsers: cartItems.map(ci => ci.user.email),
      });
    }
  } catch (error) {
    console.error(`Failed to invalidate carts for product ${productId}:`, error);
  }
}

/**
 * Validate category can be deleted (soft-delete)
 * Must not have active products
 */
export async function validateCategoryDeletion(categoryId) {
  const activeProducts = await prisma.product.count({
    where: {
      categoryId,
      isActive: true,
    },
  });

  if (activeProducts > 0) {
    throw new Error(
      `Cannot deactivate category with ${activeProducts} active product(s). Please deactivate or move products first`
    );
  }

  return true;
}

/**
 * Validate subcategory can be deleted (soft-delete)
 * Must not have active products
 */
export async function validateSubcategoryDeletion(subcategoryId) {
  const activeProducts = await prisma.product.count({
    where: {
      subcategoryId,
      isActive: true,
    },
  });

  if (activeProducts > 0) {
    throw new Error(
      `Cannot deactivate subcategory with ${activeProducts} active product(s). Please deactivate or move products first`
    );
  }

  return true;
}

/**
 * Soft-delete a category
 * Cascade: mark all products as inactive
 */
export async function softDeleteCategory(categoryId, adminId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // Mark category as inactive
  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { isActive: false },
  });

  // Soft-delete all products in this category
  await prisma.product.updateMany({
    where: { categoryId },
    data: { isActive: false },
  });

  // Log action
  await logProductAudit(adminId, categoryId, 'CATEGORY_DEACTIVATE', { isActive: true }, { isActive: false });

  integrityEvents.emit('category:deactivated', {
    categoryId,
    categoryName: category.name,
    affectedProducts: await prisma.product.count({ where: { categoryId } }),
  });

  return updated;
}

/**
 * Soft-delete a product
 */
export async function softDeleteProduct(productId, adminId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });

  // Invalidate carts
  await invalidateProductCarts(productId, 'PRODUCT_DELETED');

  // Log action
  await logProductAudit(adminId, productId, 'PRODUCT_DEACTIVATE', { isActive: true }, { isActive: false });

  return updated;
}

/**
 * Handle order status transitions with guards
 */
export async function transitionOrderStatus(orderId, newStatus, adminId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: { product: true },
      },
      prescription: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [], // Terminal state
    CANCELLED: [], // Terminal state
    REFUNDED: [], // Terminal state
  };

  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new Error(`Invalid transition from ${order.status} to ${newStatus}`);
  }

  // Guard: Check Rx requirement before confirming
  if (newStatus === 'CONFIRMED') {
    await validateOrderPrescriptionRequirement(
      order.orderItems.map(oi => ({ productId: oi.productId, userId: order.userId })),
      order.prescriptionId
    );

    // Check stock availability
    for (const item of order.orderItems) {
      if (item.product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}. Available: ${item.product.stockQuantity}, Required: ${item.quantity}`);
      }
    }
  }

  // Update order status
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus, updatedAt: new Date() },
  });

  // Log action
  await logOrderAudit(adminId, orderId, 'STATUS_CHANGE', { status: order.status }, { status: newStatus });

  integrityEvents.emit('order:status_changed', {
    orderId,
    oldStatus: order.status,
    newStatus,
    adminId,
  });

  return updated;
}

/**
 * Audit logger for orders
 */
async function logOrderAudit(adminId, orderId, action, oldValue, newValue) {
  try {
    await prisma.$executeRaw`
      INSERT INTO order_audit_logs (admin_id, order_id, action, old_value, new_value, timestamp)
      VALUES (${adminId}, ${orderId}, ${action}, ${JSON.stringify(oldValue)}::jsonb, ${JSON.stringify(newValue)}::jsonb, CURRENT_TIMESTAMP)
    `;
  } catch (error) {
    console.error('Failed to log order audit:', error);
  }
}

/**
 * Monitor and respond to integrity events
 */
export function setupIntegrityEventListeners() {
  integrityEvents.on('product:out_of_stock', async (data) => {
    console.log(`[ALERT] Product out of stock: ${data.productName}`);
    await invalidateProductCarts(data.productId, 'OUT_OF_STOCK');
  });

  integrityEvents.on('product:low_stock_alert', (data) => {
    console.warn(`[WARNING] Low stock alert: ${data.productName} (Current: ${data.currentStock}, Min: ${data.minLevel})`);
  });

  integrityEvents.on('category:deactivated', async (data) => {
    console.log(`[AUDIT] Category deactivated: ${data.categoryName} (${data.affectedProducts} products)`);
  });

  integrityEvents.on('carts:invalidated', (data) => {
    console.log(`[AUDIT] ${data.affectedUserCount} cart(s) invalidated - Reason: ${data.reason}`);
  });

  integrityEvents.on('order:status_changed', (data) => {
    console.log(`[AUDIT] Order ${data.orderId}: ${data.oldStatus} → ${data.newStatus}`);
  });
}

export default {
  validateProductIntegrity,
  updateProductStock,
  validateOrderPrescriptionRequirement,
  invalidateProductCarts,
  validateCategoryDeletion,
  softDeleteCategory,
  softDeleteProduct,
  transitionOrderStatus,
  integrityEvents,
  setupIntegrityEventListeners,
};
