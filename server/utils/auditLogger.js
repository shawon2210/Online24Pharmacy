/**
 * Comprehensive Audit Logger for Admin Actions
 * Logs all admin operations with full change tracking for GDPR/DGDA compliance
 * Timezone: UTC+06 (Bangladesh/Dhaka)
 */

import prisma from '../db/prisma.js';

/**
 * Format timestamp in Dhaka timezone
 */
export function getDhakaTimestamp() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
  });
}

/**
 * Logs an action performed by an admin user (legacy compatibility)
 * @param {object} options - The options for logging.
 * @param {string} options.adminId - The ID of the admin user performing the action.
 * @param {string} options.action - A descriptive name for the action (e.g., "UPDATE_PRODUCT").
 * @param {string} [options.targetType] - The type of the entity being acted upon (e.g., "Product").
 * @param {string} [options.targetId] - The ID of the entity being acted upon.
 * @param {object} [options.details] - A JSON object containing details about the action.
 * @param {string} [options.ipAddress] - The IP address of the client.
 */
export const logAdminAction = async ({ adminId, action, targetType, targetId, details, ipAddress }) => {
  if (!adminId || !action) {
    console.error('Audit Error: adminId and action are required to log an admin action.');
    return;
  }

  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        details: details || {},
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

/**
 * Log product audit event with change tracking
 */
export async function logProductAudit(adminId, productId, action, oldValue, newValue, ipAddress = null) {
  try {
    await prisma.$executeRaw`
      INSERT INTO product_audit_logs (admin_id, product_id, action, old_value, new_value, ip_address, timestamp)
      VALUES (
        ${adminId}::uuid,
        ${productId},
        ${action},
        ${oldValue ? JSON.stringify(oldValue) : null}::jsonb,
        ${newValue ? JSON.stringify(newValue) : null}::jsonb,
        ${ipAddress},
        CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
      )
    `;

    // Also log to admin_logs for general audit trail
    await logAdminAction({
      adminId,
      action: `PRODUCT_${action}`,
      targetType: 'Product',
      targetId: productId,
      details: { old: oldValue, new: newValue },
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to log product audit:', error);
  }
}

/**
 * Log stock movement
 */
export async function logStockMovement(data) {
  const { productId, movementType, quantityChange, reason, adminId = null, orderId = null } = data;

  try {
    await prisma.$executeRaw`
      INSERT INTO stock_movement_logs (product_id, movement_type, quantity_change, reason, admin_id, order_id, timestamp)
      VALUES (
        ${productId},
        ${movementType},
        ${quantityChange},
        ${reason},
        ${adminId}::uuid,
        ${orderId},
        CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
      )
    `;
  } catch (error) {
    console.error('Failed to log stock movement:', error);
  }
}

/**
 * Log prescription audit event (2-year retention for DGDA)
 */
export async function logPrescriptionAudit(adminId, prescriptionId, action, oldStatus, newStatus, adminNotes = null, ipAddress = null) {
  try {
    await prisma.$executeRaw`
      INSERT INTO prescription_audit_logs (admin_id, prescription_id, action, old_status, new_status, admin_notes, ip_address, timestamp)
      VALUES (
        ${adminId}::uuid,
        ${prescriptionId},
        ${action},
        ${oldStatus},
        ${newStatus},
        ${adminNotes},
        ${ipAddress},
        CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
      )
    `;

    // Also log to admin_logs
    await logAdminAction({
      adminId,
      action: `PRESCRIPTION_${action}`,
      targetType: 'Prescription',
      targetId: prescriptionId,
      details: { oldStatus, newStatus, notes: adminNotes },
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to log prescription audit:', error);
  }
}

/**
 * Log order audit event
 */
export async function logOrderAudit(adminId, orderId, action, oldValue, newValue, ipAddress = null) {
  try {
    await prisma.$executeRaw`
      INSERT INTO order_audit_logs (admin_id, order_id, action, old_value, new_value, ip_address, timestamp)
      VALUES (
        ${adminId}::uuid,
        ${orderId},
        ${action},
        ${oldValue ? JSON.stringify(oldValue) : null}::jsonb,
        ${newValue ? JSON.stringify(newValue) : null}::jsonb,
        ${ipAddress},
        CURRENT_TIMESTAMP AT TIME ZONE 'UTC+06'
      )
    `;

    // Also log to admin_logs
    await logAdminAction({
      adminId,
      action: `ORDER_${action}`,
      targetType: 'Order',
      targetId: orderId,
      details: { old: oldValue, new: newValue },
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to log order audit:', error);
  }
}

/**
 * Log customer/user view access (for GDPR audit)
 */
export async function logCustomerAccessAudit(adminId, userId, action, ipAddress = null) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: `CUSTOMER_${action}`,
        targetType: 'Customer',
        targetId: userId,
        ipAddress,
        userAgent: null,
      },
    });
  } catch (error) {
    console.error('Failed to log customer access audit:', error);
  }
}

/**
 * Get product audit history
 */
export async function getProductAuditHistory(productId, limit = 50) {
  try {
    const logs = await prisma.$queryRaw`
      SELECT 
        pal.id,
        pal.admin_id,
        u.email as admin_email,
        pal.action,
        pal.old_value,
        pal.new_value,
        pal.ip_address,
        pal.timestamp
      FROM product_audit_logs pal
      LEFT JOIN users u ON pal.admin_id = u.id
      WHERE pal.product_id = ${productId}
      ORDER BY pal.timestamp DESC
      LIMIT ${limit}
    `;
    return logs;
  } catch (error) {
    console.error('Failed to fetch product audit history:', error);
    return [];
  }
}

/**
 * Get prescription audit history (retention: 2 years for DGDA)
 */
export async function getPrescriptionAuditHistory(prescriptionId, limit = 50) {
  try {
    const logs = await prisma.$queryRaw`
      SELECT 
        pal.id,
        pal.admin_id,
        u.email as admin_email,
        pal.action,
        pal.old_status,
        pal.new_status,
        pal.admin_notes,
        pal.ip_address,
        pal.timestamp
      FROM prescription_audit_logs pal
      LEFT JOIN users u ON pal.admin_id = u.id
      WHERE pal.prescription_id = ${prescriptionId}
      ORDER BY pal.timestamp DESC
      LIMIT ${limit}
    `;
    return logs;
  } catch (error) {
    console.error('Failed to fetch prescription audit history:', error);
    return [];
  }
}

/**
 * Get stock movement history
 */
export async function getStockMovementHistory(productId, limit = 50) {
  try {
    const logs = await prisma.$queryRaw`
      SELECT 
        sml.id,
        sml.movement_type,
        sml.quantity_change,
        sml.reason,
        sml.admin_id,
        u.email as admin_email,
        sml.order_id,
        sml.timestamp
      FROM stock_movement_logs sml
      LEFT JOIN users u ON sml.admin_id = u.id
      WHERE sml.product_id = ${productId}
      ORDER BY sml.timestamp DESC
      LIMIT ${limit}
    `;
    return logs;
  } catch (error) {
    console.error('Failed to fetch stock movement history:', error);
    return [];
  }
}

/**
 * Get order audit history
 */
export async function getOrderAuditHistory(orderId, limit = 50) {
  try {
    const logs = await prisma.$queryRaw`
      SELECT 
        oal.id,
        oal.admin_id,
        u.email as admin_email,
        oal.action,
        oal.old_value,
        oal.new_value,
        oal.ip_address,
        oal.timestamp
      FROM order_audit_logs oal
      LEFT JOIN users u ON oal.admin_id = u.id
      WHERE oal.order_id = ${orderId}
      ORDER BY oal.timestamp DESC
      LIMIT ${limit}
    `;
    return logs;
  } catch (error) {
    console.error('Failed to fetch order audit history:', error);
    return [];
  }
}

/**
 * Get all admin logs with filtering
 */
export async function getAdminLogs(filters = {}, limit = 100, offset = 0) {
  const { adminId, action, targetType, startDate, endDate } = filters;

  try {
    const where = {};

    if (adminId) where.adminId = adminId;
    if (action) where.action = { contains: action };
    if (targetType) where.targetType = targetType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: { email: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.adminLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  } catch (error) {
    console.error('Failed to fetch admin logs:', error);
    return { logs: [], total: 0, limit, offset };
  }
}

/**
 * Cleanup old prescription logs (retention: keep only 2 years for GDPR)
 */
export async function cleanupOldPrescriptionLogs() {
  try {
    const result = await prisma.$executeRaw`
      DELETE FROM prescription_audit_logs
      WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '2 years'
    `;
    console.log(`Cleaned up old prescription logs: ${result} rows deleted`);
    return result;
  } catch (error) {
    console.error('Failed to cleanup old prescription logs:', error);
  }
}

export default {
  logAdminAction,
  logProductAudit,
  logStockMovement,
  logPrescriptionAudit,
  logOrderAudit,
  logCustomerAccessAudit,
  getProductAuditHistory,
  getPrescriptionAuditHistory,
  getStockMovementHistory,
  getOrderAuditHistory,
  getAdminLogs,
  cleanupOldPrescriptionLogs,
  getDhakaTimestamp,
};
