/**
 * ============================================
 * ADMIN CONTROLLER
 * ============================================
 * 
 * Handles all administrative operations including:
 * - Dashboard analytics and statistics
 * - Product, category, and inventory management
 * - Order and prescription review
 * - User management and session control
 * - Audit logging for compliance
 */

import prisma from '../db/prisma.js';

/**
 * ============================================
 * DASHBOARD & ANALYTICS
 * ============================================
 */

/**
 * Get admin dashboard statistics
 * Aggregates key metrics: orders, prescriptions, revenue, customers
 * 
 * @route GET /api/admin/dashboard
 * @access Admin only
 * @returns {Object} Dashboard stats and recent orders
 */
export async function getDashboard(req, res) {
  try {
    const [totalOrders, pendingPrescriptions, totalRevenue, totalCustomers] = await Promise.all([
      prisma.order.count(),
      prisma.prescription.count({ where: { status: 'pending' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'completed' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } })
    ]);

    const recentOrders = await prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true } } } });

    return res.json({ stats: { totalOrders, pendingPrescriptions, totalRevenue: totalRevenue._sum?.totalAmount || 0, totalCustomers }, recentOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

/**
 * ============================================
 * PRODUCT MANAGEMENT
 * ============================================
 */

/**
 * List all products with category information
 * @route GET /api/admin/products
 * @access Admin only
 * @returns {Object} Array of products with categories
 */
export async function listProducts(req, res) {
  try {
    const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
    return res.json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

/**
 * Create new product category
 * @route POST /api/admin/categories
 * @param {string} req.body.name - Category name (must be unique)
 * @returns {Object} Created category
 * @throws {409} Category already exists
 */
export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    const newCategory = await prisma.category.create({ data: { name } });
    res.json({ category: newCategory });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
}

/**
 * Create new subcategory under existing category
 * @route POST /api/admin/subcategories
 * @param {string} req.body.name - Subcategory name
 * @param {string} req.body.categoryId - Parent category ID
 * @returns {Object} Created subcategory
 * @throws {409} Subcategory already exists for this category
 */
export async function createSubcategory(req, res) {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) return res.status(400).json({ error: 'Subcategory name and categoryId required' });
    const newSubcategory = await prisma.subcategory.create({ data: { name, categoryId } });
    res.json({ subcategory: newSubcategory });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Subcategory already exists for this category' });
    }
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
}

/**
 * Create new product
 * @route POST /api/admin/products
 * @param {Object} req.body - Product data
 * @param {string} req.body.name - Product name
 * @param {string} req.body.description - Product description
 * @param {number} req.body.price - Product price
 * @param {string} req.body.subcategoryId - Subcategory ID
 * @returns {Object} Created product
 */
export async function createProduct(req, res) {
  try {
    const { name, description, price, subcategoryId, ...rest } = req.body;
    if (!name || !subcategoryId) return res.status(400).json({ error: 'Product name and subcategoryId required' });
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        subcategoryId,
        ...rest
      }
    });
    res.json({ product: newProduct });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

/**
 * Update existing product
 * Logs admin action for audit trail
 * 
 * @route PUT /api/admin/products/:id
 * @param {string} req.params.id - Product ID
 * @param {Object} req.body - Updated product data
 * @returns {Object} Updated product with category
 */
export async function updateProduct(req, res) {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body, include: { category: true } });
    
    // Log admin action for compliance
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_PRODUCT',
        targetType: 'PRODUCT',
        targetId: req.params.id,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      }
    }).catch(() => {});
    
    return res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

/**
 * ============================================
 * ORDER MANAGEMENT
 * ============================================
 */

/**
 * List all orders with user and product details
 * @route GET /api/admin/orders
 * @access Admin only
 * @returns {Object} Array of orders with related data
 */
export async function listOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({ 
      include: { 
        user: { select: { id: true, firstName: true, lastName: true, email: true } }, 
        orderItems: { include: { product: true } } 
      }, 
      orderBy: { createdAt: 'desc' } 
    });
    return res.json({ orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * Update order status (pending, processing, shipped, delivered)
 * Logs status change for audit trail
 * 
 * @route PUT /api/admin/orders/:id/status
 * @param {string} req.params.id - Order ID
 * @param {string} req.body.status - New order status
 * @returns {Object} Updated order
 */
export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status, updatedAt: new Date() } });
    
    // Log status change for audit
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_ORDER_STATUS',
        targetType: 'ORDER',
        targetId: req.params.id,
        metadata: JSON.stringify({ status }),
        ipAddress: req.ip || req.headers['x-forwarded-for']
      }
    }).catch(() => {});
    
    return res.json(order);
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

/**
 * ============================================
 * PRESCRIPTION MANAGEMENT
 * ============================================
 */

/**
 * List all prescriptions with user details
 * Used for DGDA-compliant prescription verification
 * 
 * @route GET /api/admin/prescriptions
 * @access Admin/Pharmacist only
 * @returns {Object} Array of prescriptions
 */
export async function listPrescriptions(req, res) {
  try {
    const prescriptions = await prisma.prescription.findMany({ 
      include: { 
        user: { 
          select: { id: true, firstName: true, lastName: true, email: true, phone: true } 
        } 
      }, 
      orderBy: { createdAt: 'desc' } 
    });
    return res.json({ prescriptions });
  } catch (error) {
    console.error('Failed to fetch prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
}

/**
 * Review and approve/reject prescription
 * Critical for DGDA compliance - requires pharmacist verification
 * 
 * @route PUT /api/admin/prescriptions/:id/review
 * @param {string} req.params.id - Prescription ID
 * @param {string} req.body.status - New status (approved/rejected)
 * @param {string} req.body.adminNotes - Pharmacist notes
 * @returns {Object} Updated prescription with user details
 */
export async function reviewPrescription(req, res) {
  try {
    const { status, adminNotes } = req.body;
    const prescription = await prisma.prescription.update({ 
      where: { id: req.params.id }, 
      data: { status, adminNotes, verifiedBy: req.user.id, verifiedAt: new Date(), updatedAt: new Date() },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });
    
    // Log prescription review for audit
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'REVIEW_PRESCRIPTION',
        targetType: 'PRESCRIPTION',
        targetId: req.params.id,
        metadata: JSON.stringify({ status, adminNotes }),
        ipAddress: req.ip || req.headers['x-forwarded-for']
      }
    }).catch(() => {});
    
    return res.json(prescription);
  } catch (error) {
    console.error('Failed to review prescription:', error);
    res.status(500).json({ error: 'Failed to review prescription' });
  }
}

/**
 * ============================================
 * INVENTORY MANAGEMENT
 * ============================================
 */

/**
 * Get inventory levels for all products
 * @route GET /api/admin/inventory
 * @access Admin only
 * @returns {Object} Inventory data with product details
 */
export async function getInventory(req, res) {
  try {
    const inventory = await prisma.inventory.findMany({ include: { product: true } });
    return res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

export async function updateInventory(req, res) {
  try {
    const updated = await prisma.inventory.updateMany({ where: {}, data: req.body });
    return res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
}

/**
 * ============================================
 * PROMOTIONS & MARKETING
 * ============================================
 */

/**
 * List all active and scheduled promotions
 * @route GET /api/admin/promotions
 * @access Admin only
 */
export async function listPromotions(req, res) {
  try {
    const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ promotions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
}

export async function createPromotion(req, res) {
  try {
    const promotion = await prisma.promotion.create({ data: req.body });
    return res.status(201).json(promotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
}

/**
 * ============================================
 * SUPPLIER MANAGEMENT
 * ============================================
 */

/**
 * List all registered suppliers
 * @route GET /api/admin/suppliers
 * @access Admin only
 */
export async function listSuppliers(req, res) {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ suppliers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
}

export async function addSupplier(req, res) {
  try {
    const s = await prisma.supplier.create({ data: req.body });
    return res.status(201).json(s);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add supplier' });
  }
}

export async function updateSupplier(req, res) {
  try {
    const s = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body });
    return res.json(s);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
}

/**
 * ============================================
 * USER MANAGEMENT
 * ============================================
 */

/**
 * List all customer accounts
 * Excludes password hash for security
 * 
 * @route GET /api/admin/customers
 * @access Admin only
 * @returns {Object} Array of customer profiles
 */
export async function listCustomers(req, res) {
  try {
    const users = await prisma.user.findMany({ 
      where: { role: 'CUSTOMER' }, 
      select: { id: true, email: true, firstName: true, lastName: true, isActive: true, lastLoginAt: true, createdAt: true } 
    });
    return res.json({ customers: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

/**
 * Enable or disable user account
 * When disabled, all active sessions are revoked
 * 
 * @route PUT /api/admin/users/:id/status
 * @param {string} req.params.id - User ID
 * @param {boolean} req.body.isActive - Account status
 * @returns {Object} Updated user
 */
export async function toggleUserStatus(req, res) {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive }
    });

    // Log user status change
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: isActive ? 'ENABLE_USER' : 'DISABLE_USER',
        targetType: 'USER',
        targetId: req.params.id,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      }
    });

    // Revoke all sessions when disabling account
    if (!isActive) {
      await prisma.session.updateMany({
        where: { userId: req.params.id },
        data: { isRevoked: true }
      });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
}

/**
 * Get all sessions for a specific user
 * Used for security monitoring and session management
 * 
 * @route GET /api/admin/users/:id/sessions
 * @param {string} req.params.id - User ID
 * @returns {Object} Array of user sessions
 */
export async function getUserSessions(req, res) {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

/**
 * Revoke specific user session
 * Forces logout from specific device/browser
 * 
 * @route DELETE /api/admin/sessions/:sessionId
 * @param {string} req.params.sessionId - Session ID to revoke
 * @returns {Object} Success message
 */
export async function revokeSession(req, res) {
  try {
    await prisma.session.update({
      where: { id: req.params.sessionId },
      data: { isRevoked: true }
    });

    // Log session revocation
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'REVOKE_SESSION',
        targetType: 'SESSION',
        targetId: req.params.sessionId,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      }
    });

    res.json({ message: 'Session revoked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to revoke session' });
  }
}

/**
 * Get audit log of admin actions
 * Returns last 100 actions for compliance monitoring
 * 
 * @route GET /api/admin/actions
 * @access Admin only
 * @returns {Object} Array of admin actions
 */
export async function getAdminActions(req, res) {
  try {
    const actions = await prisma.adminAction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json({ actions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch admin actions' });
  }
}

/**
 * Get analytics data
 * Currently aliases to dashboard endpoint
 * 
 * @route GET /api/admin/analytics
 * @access Admin only
 * @returns {Object} Analytics data
 */
export async function getAnalytics(req, res) {
  return getDashboard(req, res);
}
