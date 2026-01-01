import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';
import { geocodeAddress, batchGeocodeMissing } from '../utils/geocoding.js';
import { startJob as startGeocodeJob, status as geocodeStatus } from '../cron/geocodeManager.js';

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

// Category Management
router.get('/categories', authenticateToken, adminAuth, async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'categories.json');
    const data = await fs.readFile(filePath, 'utf8').catch(() => '[]');
    res.json({ categories: JSON.parse(data) });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', authenticateToken, adminAuth, async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'categories.json');
    const data = await fs.readFile(filePath, 'utf8').catch(() => '[]');
    const categories = JSON.parse(data);
    const newCategory = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
    categories.push(newCategory);
    await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
    res.status(201).json(newCategory);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'categories.json');
    const data = await fs.readFile(filePath, 'utf8').catch(() => '[]');
    const categories = JSON.parse(data);
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Category not found' });
    categories[index] = { ...categories[index], ...req.body, updatedAt: new Date() };
    await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
    res.json(categories[index]);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'categories.json');
    const data = await fs.readFile(filePath, 'utf8').catch(() => '[]');
    const categories = JSON.parse(data).filter(c => c.id !== req.params.id);
    await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
    res.json({ message: 'Category deleted' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Pickup Locations Management
router.get('/pickup-locations', authenticateToken, adminAuth, async (req, res) => {
  try {
    const locations = await prisma.pickupLocation.findMany({
      include: { inventory: true }
    });
    res.json(locations);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch pickup locations' });
  }
});

router.post('/pickup-locations', authenticateToken, adminAuth, async (req, res) => {
  try {
    let { name, address, lat, lng, open_hours, is_active } = req.body;

    lat = lat !== undefined && lat !== null && lat !== '' ? parseFloat(lat) : null;
    lng = lng !== undefined && lng !== null && lng !== '' ? parseFloat(lng) : null;

    if (!lat || !lng) {
      const geo = await geocodeAddress(address || name || '');
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }

    const location = await prisma.pickupLocation.create({
      data: {
        name,
        address,
        lat,
        lng,
        open_hours,
        is_active: is_active !== undefined ? is_active : true
      }
    });
    res.json(location);
  } catch (error) {
    console.error('Error creating pickup location:', error);
    res.status(500).json({ error: 'Failed to create pickup location' });
  }
});

router.put('/pickup-locations/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    let { name, address, lat, lng, open_hours, is_active } = req.body;

    lat = lat !== undefined && lat !== null && lat !== '' ? parseFloat(lat) : null;
    lng = lng !== undefined && lng !== null && lng !== '' ? parseFloat(lng) : null;

    if (!lat || !lng) {
      const geo = await geocodeAddress(address || name || '');
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }

    const location = await prisma.pickupLocation.update({
      where: { id: req.params.id },
      data: { name, address, lat, lng, open_hours, is_active }
    });
    res.json(location);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update pickup location' });
  }
});

router.delete('/pickup-locations/:id', authenticateToken, adminAuth, async (req, res) => {
  try {
    await prisma.pickupLocation.delete({ where: { id: req.params.id } });
    res.json({ message: 'Pickup location deleted' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete pickup location' });
  }
});

// Batch geocode missing pickup locations (admin only)
router.post('/pickup-locations/batch-geocode', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { limit = 20, delayMs = 1000 } = req.body || {};
    const result = await batchGeocodeMissing(prisma, { limit, delayMs });
    res.json(result);
  } catch (error) {
    console.error('Batch geocode error', error);
    res.status(500).json({ error: 'Failed to batch geocode pickup locations' });
  }
});

// Start a background job for geocoding (non-blocking)
router.post('/pickup-locations/start-geocode-job', authenticateToken, adminAuth, async (req, res) => {
  try {
    const { limit = 20, delayMs = 1000 } = req.body || {};
    // Start job but do not await so we respond immediately
    startGeocodeJob(prisma, { limit, delayMs })
      .then((r) => console.log('Background geocode job finished:', r))
      .catch((e) => console.error('Background geocode job failed:', e));
    res.status(202).json({ message: 'Geocode job started' });
  } catch (error) {
    console.error('Failed to start geocode job', error);
    res.status(500).json({ error: 'Failed to start geocode job' });
  }
});

router.get('/pickup-locations/geocode-status', authenticateToken, adminAuth, async (_req, res) => {
  try {
    res.json(geocodeStatus());
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch geocode job status' });
  }
});

export default router;