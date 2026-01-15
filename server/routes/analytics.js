

import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();

// Helper function to get date range
const getDateRange = (timeRange) => {
  const now = new Date();
  const ranges = {
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
  };
  return ranges[timeRange] || ranges['30d'];
};

// Admin analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.range || '30d';
    const startDate = getDateRange(timeRange);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      completedOrders,
      topProducts,
      salesTrend,
      recentOrders,
      customerGrowth,
      orderStatusDistribution
    ] = await Promise.all([
      // Total revenue for the period
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          paymentStatus: 'completed',
          createdAt: { gte: startDate }
        }
      }),

      // Total orders for the period
      prisma.order.count({
        where: { createdAt: { gte: startDate } }
      }),

      // Total customers (all time)
      prisma.user.count({
        where: { role: 'USER' }
      }),

      // Completed orders for conversion rate
      prisma.order.count({
        where: {
          paymentStatus: 'completed',
          createdAt: { gte: startDate }
        }
      }),

      // Top products by sales volume
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: {
          order: {
            createdAt: { gte: startDate },
            paymentStatus: 'completed'
          }
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10
      }),

      // Sales trend data (daily for the period)
      prisma.$queryRaw`
        SELECT
          DATE(created_at) as date,
          SUM(total_amount) as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE created_at >= ${startDate}
          AND payment_status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `,

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      }),

      // Customer growth (monthly)
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as new_customers
        FROM users
        WHERE role = 'USER'
          AND created_at >= ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `,

      // Order status distribution
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { createdAt: { gte: startDate } }
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
      name: products.find(p => p.id === item.productId)?.name || 'Unknown Product'
    }));

    // Calculate conversion rate
    const conversionRate = totalCustomers > 0
      ? ((completedOrders / totalCustomers) * 100).toFixed(1)
      : 0;

    res.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalCustomers,
      conversionRate: parseFloat(conversionRate),
      topProducts: topProductsWithNames.map(item => ({
        name: item.name,
        sales: item._sum.quantity
      })),
      salesTrend: Array.isArray(salesTrend) ? salesTrend.map(item => ({
        date: item.date,
        revenue: parseFloat(item.revenue || 0),
        orders: parseInt(item.orders || 0)
      })) : [],
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        customer: {
          name: `${order.user.firstName} ${order.user.lastName}`,
          email: order.user.email
        }
      })),
      customerGrowth: Array.isArray(customerGrowth) ? customerGrowth.map(item => ({
        month: item.month,
        newCustomers: parseInt(item.new_customers)
      })) : [],
      orderStatusDistribution: orderStatusDistribution.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = item._count.status;
        return acc;
      }, {}),
      timeRange
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
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