import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../db/prisma.js';
import { logAdminAction } from '../../utils/auditLogger.js';

const router = Router();

// Allowed order status transitions
const statusTransitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
};

// GET /api/admin/orders - List all orders with pagination and filtering
router.get('/', async (req, res) => {
  const { page = 1, limit = 15, status, search } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  try {
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const totalOrders = await prisma.order.count({ where });

    res.json({
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        totalItems: totalOrders,
      },
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/admin/orders/:id - Get a single order's details
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: { include: { product: true } },
        orderTracking: { orderBy: { createdAt: 'asc' } },
        prescription: true,
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch order details.' });
  }
});

// PUT /api/admin/orders/:id/status - Update an order's status
router.put('/:id/status', [body('status').notEmpty().withMessage('Status is required.')], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { status: newStatus } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const allowedStatuses = statusTransitions[order.status];
    if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
      return res.status(400).json({ error: `Invalid status transition from ${order.status} to ${newStatus}.` });
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: newStatus },
      }),
      prisma.orderTracking.create({
        data: {
          orderId: id,
          status: newStatus,
          description: `Order status updated to ${newStatus} by admin.`,
        },
      }),
    ]);

    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'Order',
      targetId: id,
      details: { from: order.status, to: newStatus },
      ipAddress: req.ip,
    });

    // TODO: Send notification to user about status update

    res.json(updatedOrder);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

export default router;

