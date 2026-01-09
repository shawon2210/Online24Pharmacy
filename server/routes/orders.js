import express from 'express';
import { authenticateToken } from '../middleware/roleAuth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Create order
router.post('/', authenticateToken, async (req, res) => {
  const { items, shippingAddress, paymentMethod, total } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    const order = await prisma.$transaction(async (prisma) => {
      const createdOrder = await prisma.order.create({
        data: {
          userId,
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod,
          totalAmount: total,
          orderNumber: 'LP' + Date.now().toString().slice(-8),
          orderItems: {
            create: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: item.product.price * item.quantity,
            })),
          },
        },
      });

      for (const item of items) {
        await prisma.product.update({
          where: { id: item.product.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
