import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();

// Admin analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      topProducts,
      salesTrend
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'completed' }
      }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        _sum: { totalAmount: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    // Get product details for top products
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    });

    const topProductsWithNames = topProducts.map(item => ({
      ...item,
      name: products.find(p => p.id === item.productId)?.name || 'Unknown'
    }));

    res.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalCustomers,
      conversionRate: totalOrders > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(1) : 0,
      topProducts: topProductsWithNames.map(item => ({
        name: item.name,
        sales: item._sum.quantity
      })),
      salesTrend: salesTrend.map(item => ({
        date: item.createdAt,
        revenue: item._sum.totalAmount
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Track events (public)
router.post('/track', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Analytics Event:', { event, data, timestamp: new Date() });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

export default router;