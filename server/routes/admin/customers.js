import { Router } from 'express';
import prisma from '../../db/prisma.js';

const router = Router();

// GET /api/admin/customers - List all customers with search and pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 15, search = '' } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  try {
    const where = {
      role: { in: ['USER', 'CUSTOMER'] },
    };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    const totalCustomers = await prisma.user.count({ where });

    res.json({
      data: customers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCustomers / limitNum),
        totalItems: totalCustomers,
      },
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// GET /api/admin/customers/:id - Get a single customer's details (read-only)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit to recent orders for performance
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    if (customer.role === 'ADMIN') {
        return res.status(403).json({ error: 'Cannot view admin details through this endpoint.' });
    }

    res.json(customer);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch customer details.' });
  }
});

export default router;

