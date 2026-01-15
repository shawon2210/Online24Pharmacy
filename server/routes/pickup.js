import express from 'express';
import prisma from '../db/prisma.js';
const router = express.Router();

// GET /api/pickup-locations
router.get('/pickup-locations', async (req, res) => {
  try {
    // Only show shops uploaded by admin (new Shop model)
    const shops = await prisma.shop.findMany({ orderBy: { id: 'desc' } });
    const response = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      lat: shop.lat,
      lng: shop.lng,
      open_hours: shop.open_hours,
    }));
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
