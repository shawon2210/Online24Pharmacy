

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

    // Simple counts first
    const totalOrders = await prisma.order.count({
      where: { createdAt: { gte: startDate } }
    });

    const totalCustomers = await prisma.user.count({
      where: { role: 'USER' }
    });

    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: startDate }
      }
    });

    res.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalCustomers,
      conversionRate: 0,
      pendingPrescriptions: 0,
      topProducts: [],
      salesTrend: [],
      recentOrders: [],
      customerGrowth: [],
      orderStatusDistribution: {},
      timeRange
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data', details: error.message });
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