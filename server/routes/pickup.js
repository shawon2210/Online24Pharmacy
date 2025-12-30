import express from 'express';
import prisma from '../db/prisma.js';
const router = express.Router();

// GET /api/pickup-locations?productId=...
router.get('/pickup-locations', async (req, res) => {
  const { productId } = req.query;
  if (!productId) {
    // Return all active locations
    try {
      const locations = await prisma.pickupLocation.findMany({
        where: { is_active: true },
        include: { inventory: true }
      });
      const response = locations.map(location => ({
        id: location.id,
        name: location.name,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        hours: location.open_hours,
        inStock: false // No specific product, so not in stock check
      }));
      res.setHeader('Content-Type', 'application/json');
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  try {
    const locations = await prisma.pickupLocation.findMany({
      where: {
        is_active: true,
        inventory: {
          some: {
            productId: productId,
            stock_quantity: {
              gt: 0,
            },
          },
        },
      },
      include: {
        inventory: {
          where: {
            productId: productId,
          },
        },
      },
    });

    const response = locations.map(location => ({
      id: location.id,
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      open_hours: location.open_hours,
      inStock: location.inventory.length > 0 && location.inventory[0].stock_quantity > 0,
    }));

    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
