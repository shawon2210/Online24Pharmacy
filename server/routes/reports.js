import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();

// Sales report
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const salesData = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        paymentStatus: 'completed'
      },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    const summary = {
      totalSales: salesData.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      totalOrders: salesData.length,
      averageOrderValue: salesData.length > 0 ? 
        salesData.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) / salesData.length : 0,
      topProducts: {}
    };

    res.json({ summary, orders: salesData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Inventory report
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const inventory = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        minStockLevel: true,
        price: true
      }
    });

    const lowStock = inventory.filter(item => item.stockQuantity <= item.minStockLevel);
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.stockQuantity * parseFloat(item.price)), 0
    );

    res.json({
      totalProducts: inventory.length,
      lowStockItems: lowStock.length,
      totalInventoryValue: totalValue,
      products: inventory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate inventory report' });
  }
});

export default router;