import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Dashboard stats
router.get('/dashboard', authenticateToken, adminAuth, async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      pendingPrescriptions,
      todayOrders,
      totalRevenue
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.prescription.count({ where: { status: 'pending' } }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'completed' }
      })
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      pendingPrescriptions,
      todayOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all orders
router.get('/orders', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, phone: true }
          },
          orderItems: {
            include: { product: { select: { name: true } } }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get all prescriptions
router.get('/prescriptions', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { status = 'PENDING', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let prescriptions = [];
    let total = 0;

    try {
      const where = status && status !== 'all' 
        ? { status: { equals: status.toUpperCase(), mode: 'insensitive' } }
        : {};

      [prescriptions, total] = await Promise.all([
        prisma.prescription.findMany({
          where,
          include: {
            user: {
              select: { 
                id: true,
                firstName: true, 
                lastName: true, 
                email: true, 
                phone: true 
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        prisma.prescription.count({ where })
      ]);
    } catch (prismaError) {
      console.error('Prisma error while fetching admin prescriptions:', prismaError);
      // Fallback to file storage
      const fs = await import('fs/promises');
      const path = await import('path');
      const PRESCRIPTIONS_FILE = path.default.join(process.cwd(), 'server', 'data', 'prescriptions.json');
      const USERS_FILE = path.default.join(process.cwd(), 'server', 'data', 'users.json');
      
      try {
        const [prescData, userData] = await Promise.all([
          fs.default.readFile(PRESCRIPTIONS_FILE, 'utf8').then(d => JSON.parse(d)).catch(() => []),
          fs.default.readFile(USERS_FILE, 'utf8').then(d => JSON.parse(d)).catch(() => [])
        ]);
        
        // Join prescriptions with user data
        prescriptions = prescData.map(p => {
          const user = userData.find(u => u.id === p.userId);
          return {
            ...p,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone
            } : null
          };
        });
        
        // Filter by status
        if (status && status !== 'all') {
          prescriptions = prescriptions.filter(p => 
            p.status?.toUpperCase() === status.toUpperCase()
          );
        }
        
        total = prescriptions.length;
        prescriptions = prescriptions.slice(skip, skip + parseInt(limit));
      } catch (fileError) {
        console.error('File read error:', fileError);
      }
    }

    res.json({
      prescriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get prescription details by ID
router.get('/prescriptions/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { 
            id: true,
            firstName: true, 
            lastName: true, 
            email: true, 
            phone: true 
          }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Approve/reject prescription
router.put('/prescriptions/:id/review', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: {
        status,
        adminNotes,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to review prescription' });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;