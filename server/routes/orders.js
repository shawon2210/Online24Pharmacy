import express from 'express';
import { authenticateToken } from '../middleware/roleAuth.js';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

const safeJsonParse = (value) => {
  if (value == null) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const extractOrderLookup = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return { raw: '', orderNumber: '' };

  // Common UX format: "#LP12345678" or "Order ID: LP123..."
  const lpMatch = raw.match(/\b(LP\d{6,})\b/i);
  if (lpMatch?.[1]) {
    return { raw, orderNumber: lpMatch[1].toUpperCase() };
  }

  // Fallback: strip non-alphanumerics for orderNumber comparisons.
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return { raw, orderNumber: cleaned };
};

const phoneVariants = (value) => {
  const digits = normalizePhone(value);
  const variants = new Set();
  if (!digits) return variants;

  variants.add(digits);

  // Bangladesh: +8801XXXXXXXXX (digits "8801...") ↔ local "01..." ↔ raw "1..."
  if (digits.startsWith('880') && digits.length === 13) {
    variants.add('0' + digits.slice(3));
    variants.add(digits.slice(3));
  }

  if (digits.startsWith('0') && digits.length === 11) {
    variants.add(digits.slice(1));
    variants.add('880' + digits.slice(1));
  }

  if (digits.startsWith('1') && digits.length === 10) {
    variants.add('0' + digits);
    variants.add('880' + digits);
  }

  // Some users may include country prefix without leading 0 ("88" + local)
  if (digits.startsWith('88') && digits.length > 11) {
    variants.add(digits.slice(2));
  }

  return variants;
};

const phonesMatch = (stored, input) => {
  const a = phoneVariants(stored);
  const b = phoneVariants(input);
  if (a.size === 0 || b.size === 0) return false;
  for (const v of a) {
    if (b.has(v)) return true;
  }
  return false;
};

// Public order tracking (by order number + phone)
router.post('/track', async (req, res) => {
  const { orderId, orderNumber, phone } = req.body || {};
  const { raw: lookupRaw, orderNumber: lookupOrderNumber } = extractOrderLookup(
    orderNumber || orderId
  );
  const phoneInput = String(phone || '').trim();

  if (!lookupRaw || !lookupOrderNumber || !normalizePhone(phoneInput)) {
    return res.status(400).json({
      error: 'Order ID and phone number are required',
    });
  }

  try {
    // Prefer orderNumber match (LPxxxx...), fallback to internal id.
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: lookupOrderNumber, mode: 'insensitive' } },
          { id: lookupRaw.replace(/^#+/, '') },
        ],
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        orderTracking: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found. Please check your Order ID and phone number.',
      });
    }

    const shippingAddress = safeJsonParse(order.shippingAddress) || {};
    const storedPhone =
      shippingAddress.phone ||
      shippingAddress.phoneNumber ||
      shippingAddress.mobile ||
      shippingAddress.mobileNumber;

    // Match phones defensively (users may input with/without country code).
    const phoneMatches = phonesMatch(storedPhone, phoneInput);

    if (!phoneMatches) {
      return res.status(404).json({
        error: 'Order not found. Please check your Order ID and phone number.',
      });
    }

    res.json({
      ...order,
      shippingAddress,
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// Create order
router.post('/', authenticateToken, async (req, res) => {
  const { items, shippingAddress, paymentMethod, total } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  const normalizedItems = Array.isArray(items)
    ? items
        .map((item) => {
          const quantity = Number(item?.quantity ?? 0);
          const productId = item?.product?.id ?? item?.productId;
          const unitPriceRaw = item?.product?.price ?? item?.price ?? item?.unitPrice;
          const unitPrice = Number(unitPriceRaw);

          return {
            productId,
            quantity,
            unitPrice,
          };
        })
        .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0)
    : [];

  if (normalizedItems.length === 0) {
    return res.status(400).json({
      error: 'Invalid cart items',
      message: 'Invalid cart items',
    });
  }

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    return res.status(400).json({
      error: 'Shipping address is required',
      message: 'Shipping address is required',
    });
  }

  const normalizedShippingAddress = {
    ...shippingAddress,
    phone:
      shippingAddress.phone ||
      shippingAddress.phoneNumber ||
      shippingAddress.mobile ||
      shippingAddress.mobileNumber ||
      '',
  };

  if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
    return res.status(400).json({
      error: 'Invalid order total',
      message: 'Invalid order total',
    });
  }

  try {
    const order = await prisma.$transaction(async (prisma) => {
      // Stock validation inside the transaction for consistency.
      for (const item of normalizedItems) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, stockQuantity: true, isActive: true },
        });

        if (!product || !product.isActive) {
          const error = new Error('One or more products are unavailable');
          error.statusCode = 400;
          throw error;
        }

        if (product.stockQuantity < item.quantity) {
          const error = new Error('Insufficient stock for one or more items');
          error.statusCode = 409;
          throw error;
        }
      }

      const createdOrder = await prisma.order.create({
        data: {
          userId,
          shippingAddress: JSON.stringify(normalizedShippingAddress),
          paymentMethod,
          totalAmount: new Prisma.Decimal(String(total)),
          orderNumber: 'LP' + Date.now().toString().slice(-8),
          orderItems: {
            create: normalizedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(String(item.unitPrice)),
              totalPrice: new Prisma.Decimal(String(item.unitPrice * item.quantity)),
            })),
          },
        },
      });

      for (const item of normalizedItems) {
        await prisma.product.update({
          where: { id: item.productId },
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
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    const message =
      statusCode === 409
        ? 'Insufficient stock for one or more items'
        : error?.message || 'Failed to create order';

    res.status(statusCode).json({
      error: message,
      message,
    });
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
    const normalized = orders.map((o) => ({
      ...o,
      shippingAddress: safeJsonParse(o.shippingAddress) || o.shippingAddress,
      billingAddress: safeJsonParse(o.billingAddress) || o.billingAddress,
    }));
    res.json({ orders: normalized });
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

    res.json({
      ...order,
      shippingAddress: safeJsonParse(order.shippingAddress) || order.shippingAddress,
      billingAddress: safeJsonParse(order.billingAddress) || order.billingAddress,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
