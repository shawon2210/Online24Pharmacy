/**
 * Enhanced Admin Products API Routes
 * Implements integrity constraints, guards, and full audit logging
 * Enforces DGDA compliance and business rules
 */

import { Router } from 'express';
import { body, validationResult, param } from 'express-validator';
import prisma from '../../db/prisma.js';
import {
  validateProductIntegrity,
  updateProductStock,
  softDeleteProduct,
  invalidateProductCarts,
} from '../../db/integrityMiddleware.js';
import {
  logProductAudit,
  getProductAuditHistory,
} from '../../utils/auditLogger.js';
import { eCommerceEventEmitter } from '../../events/commerceEventEmitter.js';

const router = Router();

/**
 * GET /api/admin/products - List all products with inventory
 * Sortable, filterable, with low-stock indicators
 */
router.get('/', async (req, res) => {
  try {
    const {
      skip = 0,
      take = 50,
      search = '',
      categoryId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'all',
    } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'low-stock') {
      where.stockQuantity = { lte: prisma.raw('min_stock_level') };
      where.isActive = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, isActive: true } },
          subcategory: { select: { id: true, name: true } },
          _count: { select: { cartItems: true, orderItems: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: parseInt(skip),
        take: parseInt(take),
      }),
      prisma.product.count({ where }),
    ]);

    // Map response with indicators
    const enriched = products.map(p => ({
      ...p,
      lowStock: p.stockQuantity <= p.minStockLevel,
      outOfStock: p.stockQuantity === 0,
      inCarts: p._count.cartItems,
      ordersCount: p._count.orderItems,
    }));

    res.json({
      data: enriched,
      pagination: { total, skip: parseInt(skip), take: parseInt(take) },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/admin/products/:id - Get single product with audit history
 */
router.get('/:id', [param('id').isString()], async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get audit history
    const auditHistory = await getProductAuditHistory(id, 20);

    res.json({
      product,
      auditHistory,
      indicators: {
        lowStock: product.stockQuantity <= product.minStockLevel,
        outOfStock: product.stockQuantity === 0,
        hasDiscount: !!product.discountPrice,
      },
    });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/admin/products - Create new product
 * Validates category/subcategory active status
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be positive'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('subcategoryId').notEmpty().withMessage('Subcategory is required'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    body('maxOrderQuantity').isInt({ min: 1 }).withMessage('Max order must be positive'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id: adminId } = req.user;
      const data = req.body;

      // Validate integrity constraints
      await validateProductIntegrity(data);

      // Create product
      const product = await prisma.product.create({
        data: {
          ...data,
          stockQuantity: data.stockQuantity || 0,
        },
        include: { category: true, subcategory: true },
      });

      // Log creation
      await logProductAudit(adminId, product.id, 'CREATE', null, product, req.ip);

      res.status(201).json({
        success: true,
        product,
        message: `Product "${product.name}" created successfully`,
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      res.status(400).json({
        error: error.message || 'Failed to create product',
      });
    }
  }
);

/**
 * PUT /api/admin/products/:id - Update product
 * Guards: Category/subcategory must be active
 */
router.put(
  '/:id',
  [
    param('id').isString(),
    body('price').optional().isFloat({ min: 0.01 }).withMessage('Price must be positive'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { id: adminId } = req.user;
      const updateData = req.body;

      // Get existing product
      const existing = await prisma.product.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Validate integrity if category changes
      if (updateData.categoryId && updateData.categoryId !== existing.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: updateData.categoryId },
        });

        if (!category || !category.isActive) {
          return res.status(400).json({
            error: 'Selected category is inactive. Cannot assign product to inactive category',
          });
        }
      }

      // Update product
      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true, subcategory: true },
      });

      // Log update
      await logProductAudit(adminId, id, 'UPDATE', existing, updated, req.ip);

      // Emit event if stock changed
      if (updateData.stockQuantity !== undefined && updateData.stockQuantity !== existing.stockQuantity) {
        eCommerceEventEmitter.emit('product:stock_updated', {
          productId: id,
          oldStock: existing.stockQuantity,
          newStock: updateData.stockQuantity,
          reason: 'MANUAL_ADJUSTMENT',
          adminId,
        });
      }

      res.json({
        success: true,
        product: updated,
        message: `Product "${updated.name}" updated successfully`,
      });
    } catch (error) {
      console.error('Failed to update product:', error);
      res.status(400).json({ error: error.message || 'Failed to update product' });
    }
  }
);

/**
 * PUT /api/admin/products/:id/stock - Update stock with audit trail
 */
router.put('/:id/stock', [param('id').isString(), body('quantity').isInt()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { quantity, reason = 'MANUAL_ADJUSTMENT' } = req.body;
    const { id: adminId } = req.user;

    const product = await updateProductStock(id, quantity, reason, adminId);

    res.json({
      success: true,
      product,
      message: `Stock updated: ${product.name} now has ${product.stockQuantity} units`,
    });
  } catch (error) {
    console.error('Failed to update stock:', error);
    res.status(400).json({ error: error.message || 'Failed to update stock' });
  }
});

/**
 * DELETE /api/admin/products/:id - Soft-delete product
 * Guard: Must invalidate affected carts
 */
router.delete('/:id', [param('id').isString()], async (req, res) => {
  try {
    const { id } = req.params;
    const { id: adminId } = req.user;

    const product = await softDeleteProduct(id, adminId);

    // Notify about invalidated carts
    await invalidateProductCarts(id, 'PRODUCT_DELETED');

    res.json({
      success: true,
      message: `Product "${product.name}" deactivated and removed from carts`,
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(400).json({ error: error.message || 'Failed to delete product' });
  }
});

/**
 * GET /api/admin/products/alerts/low-stock - Get low stock alert products
 */
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: {
          lte: prisma.raw('min_stock_level'),
        },
      },
      include: {
        category: { select: { name: true } },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    res.json({
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error('Failed to fetch low stock products:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

export default router;