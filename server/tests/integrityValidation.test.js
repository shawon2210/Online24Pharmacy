/**
 * Integrity Validation Tests for Online24-Pharmacy Admin
 * Ensures DGDA compliance, no orphans, no oversells, proper audit trails
 */

import prisma from '../../db/prisma.js';
import {
  validateProductIntegrity,
  updateProductStock,
  validateOrderPrescriptionRequirement,
  validateCategoryDeletion,
  transitionOrderStatus,
} from '../../db/integrityMiddleware.js';

/**
 * Test: No orphan products (all products must have active categories)
 */
export async function testNoOrphanProducts() {
  console.log('[TEST] Validating no orphan products...');

  const orphanProducts = await prisma.product.findMany({
    where: {
      OR: [
        { categoryId: null },
        {
          category: {
            isActive: false,
          },
        },
      ],
    },
  });

  if (orphanProducts.length === 0) {
    console.log('✓ PASS: No orphan products found');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${orphanProducts.length} orphan products:`);
    orphanProducts.forEach(p => {
      console.warn(`  - ${p.name} (ID: ${p.id}), CategoryID: ${p.categoryId}`);
    });
    return { pass: false, count: orphanProducts.length, products: orphanProducts };
  }
}

/**
 * Test: No negative stock
 */
export async function testNoNegativeStock() {
  console.log('[TEST] Validating no negative stock...');

  const negativeStock = await prisma.product.findMany({
    where: {
      stockQuantity: { lt: 0 },
    },
  });

  if (negativeStock.length === 0) {
    console.log('✓ PASS: No negative stock found');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${negativeStock.length} products with negative stock:`);
    negativeStock.forEach(p => {
      console.warn(`  - ${p.name}: ${p.stockQuantity}`);
    });
    return { pass: false, count: negativeStock.length, products: negativeStock };
  }
}

/**
 * Test: All prices are positive
 */
export async function testPositivePrices() {
  console.log('[TEST] Validating all prices are positive...');

  const invalidPrices = await prisma.product.findMany({
    where: {
      price: { lte: 0 },
    },
  });

  if (invalidPrices.length === 0) {
    console.log('✓ PASS: All prices are positive');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${invalidPrices.length} products with invalid prices:`);
    invalidPrices.forEach(p => {
      console.warn(`  - ${p.name}: ${p.price}`);
    });
    return { pass: false, count: invalidPrices.length, products: invalidPrices };
  }
}

/**
 * Test: Discount prices are valid
 */
export async function testValidDiscounts() {
  console.log('[TEST] Validating discount prices...');

  const invalidDiscounts = await prisma.product.findMany({
    where: {
      AND: [
        { discountPrice: { not: null } },
        {
          OR: [
            { discountPrice: { lte: 0 } },
            // Will need to filter in JS since Prisma can't compare two fields directly
          ],
        },
      ],
    },
  });

  // Manual check for discountPrice >= price
  const problematic = invalidDiscounts.filter(p => p.discountPrice >= p.price);

  if (problematic.length === 0) {
    console.log('✓ PASS: All discount prices are valid');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${problematic.length} products with invalid discounts:`);
    problematic.forEach(p => {
      console.warn(`  - ${p.name}: Discount ${p.discountPrice} >= Price ${p.price}`);
    });
    return { pass: false, count: problematic.length, products: problematic };
  }
}

/**
 * Test: Rx-required products validation
 */
export async function testRxRequiredOrders() {
  console.log('[TEST] Validating Rx-required orders have approved prescriptions...');

  const ordersNeedingRx = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          product: { requiresPrescription: true },
        },
      },
    },
    include: {
      orderItems: { include: { product: true } },
      prescription: true,
    },
  });

  const problematic = ordersNeedingRx.filter(o => !o.prescription || o.prescription.status !== 'APPROVED');

  if (problematic.length === 0) {
    console.log('✓ PASS: All Rx-required orders have approved prescriptions');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${problematic.length} orders needing Rx without approval:`);
    problematic.forEach(o => {
      const rxProducts = o.orderItems.filter(oi => oi.product.requiresPrescription).map(oi => oi.product.name);
      console.warn(`  - Order ${o.id}: Missing/unapproved Rx for ${rxProducts.join(', ')}`);
    });
    return { pass: false, count: problematic.length, orders: problematic };
  }
}

/**
 * Test: Order amounts match order items
 */
export async function testOrderAmountConsistency() {
  console.log('[TEST] Validating order total amounts...');

  const orders = await prisma.order.findMany({
    include: { orderItems: true },
  });

  const inconsistent = [];

  for (const order of orders) {
    const calculatedTotal = order.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    if (Math.abs(parseFloat(order.totalAmount) - calculatedTotal) > 0.01) {
      inconsistent.push({
        orderId: order.id,
        recorded: parseFloat(order.totalAmount),
        calculated: calculatedTotal,
      });
    }
  }

  if (inconsistent.length === 0) {
    console.log('✓ PASS: All order amounts are consistent');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${inconsistent.length} orders with inconsistent amounts:`);
    inconsistent.forEach(i => {
      console.warn(`  - Order ${i.orderId}: Recorded ${i.recorded}, Calculated ${i.calculated}`);
    });
    return { pass: false, count: inconsistent.length, orders: inconsistent };
  }
}

/**
 * Test: Customers data read-only enforcement
 * Check that no recent admin updates touched sensitive customer fields
 */
export async function testCustomerDataReadOnly() {
  console.log('[TEST] Validating customer data is read-only...');

  const recentUpdates = await prisma.adminLog.findMany({
    where: {
      AND: [
        { action: { contains: 'USER' } },
        { action: { contains: 'UPDATE' } },
        { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });

  // Should be zero (customers are read-only for admins)
  if (recentUpdates.length === 0) {
    console.log('✓ PASS: No recent customer updates by admins');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${recentUpdates.length} recent customer updates by admins`);
    return { pass: false, count: recentUpdates.length };
  }
}

/**
 * Test: All deleted items are soft-deleted
 */
export async function testSoftDeleteEnforcement() {
  console.log('[TEST] Validating soft-delete enforcement...');

  // Check if any product records have hard-deleted related records
  const orphanedOrderItems = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM order_items
    WHERE product_id NOT IN (SELECT id FROM products)
  `;

  if (orphanedOrderItems[0]?.count === 0) {
    console.log('✓ PASS: No orphaned records from hard deletes');
    return { pass: true, count: 0 };
  } else {
    console.warn(`✗ FAIL: Found ${orphanedOrderItems[0]?.count || 0} orphaned order items`);
    return { pass: false, count: orphanedOrderItems[0]?.count || 0 };
  }
}

/**
 * Test: Audit logging completeness
 */
export async function testAuditLoggingCompleteness() {
  console.log('[TEST] Validating audit logging is complete...');

  const [adminLogCount, productAuditCount] = await Promise.all([
    prisma.adminLog.count(),
    prisma.$queryRaw`SELECT COUNT(*) as count FROM product_audit_logs`,
  ]);

  const results = {
    adminLogs: adminLogCount,
    productAuditLogs: productAuditCount[0]?.count || 0,
  };

  if (adminLogCount > 0) {
    console.log('✓ PASS: Audit logs are being recorded');
    console.log(`  - Admin logs: ${adminLogCount}`);
    console.log(`  - Product audits: ${results.productAuditLogs}`);
    return { pass: true, logs: results };
  } else {
    console.warn('✗ FAIL: No audit logs found');
    return { pass: false, logs: results };
  }
}

/**
 * Test: Prescription retention policy (2 years)
 */
export async function testPrescriptionRetention() {
  console.log('[TEST] Validating prescription retention policy...');

  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const oldPrescriptionLogs = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM prescription_audit_logs
    WHERE timestamp < ${twoYearsAgo}
  `;

  if ((oldPrescriptionLogs[0]?.count || 0) === 0) {
    console.log('✓ PASS: Prescription logs older than 2 years are cleaned up');
    return { pass: true };
  } else {
    console.warn(`✗ FAIL: Found ${oldPrescriptionLogs[0]?.count || 0} prescription logs older than 2 years`);
    return { pass: false, count: oldPrescriptionLogs[0]?.count || 0 };
  }
}

/**
 * Run all tests
 */
export async function runAllValidationTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  ONLINE24-PHARMACY INTEGRITY VALIDATION TESTS');
  console.log('='.repeat(60) + '\n');

  const results = {
    tests: [],
    passed: 0,
    failed: 0,
    timestamp: new Date().toISOString(),
  };

  const tests = [
    { name: 'No Orphan Products', fn: testNoOrphanProducts },
    { name: 'No Negative Stock', fn: testNoNegativeStock },
    { name: 'Positive Prices', fn: testPositivePrices },
    { name: 'Valid Discounts', fn: testValidDiscounts },
    { name: 'Rx-Required Orders', fn: testRxRequiredOrders },
    { name: 'Order Amount Consistency', fn: testOrderAmountConsistency },
    { name: 'Customer Data Read-Only', fn: testCustomerDataReadOnly },
    { name: 'Soft-Delete Enforcement', fn: testSoftDeleteEnforcement },
    { name: 'Audit Logging Completeness', fn: testAuditLoggingCompleteness },
    { name: 'Prescription Retention Policy', fn: testPrescriptionRetention },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.tests.push({
        name: test.name,
        ...result,
      });

      if (result.pass) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`✗ ERROR in ${test.name}:`, error.message);
      results.tests.push({
        name: test.name,
        pass: false,
        error: error.message,
      });
      results.failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  RESULTS: ${results.passed} passed, ${results.failed} failed`);
  console.log('='.repeat(60) + '\n');

  return results;
}

export default {
  testNoOrphanProducts,
  testNoNegativeStock,
  testPositivePrices,
  testValidDiscounts,
  testRxRequiredOrders,
  testOrderAmountConsistency,
  testCustomerDataReadOnly,
  testSoftDeleteEnforcement,
  testAuditLoggingCompleteness,
  testPrescriptionRetention,
  runAllValidationTests,
};
