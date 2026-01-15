import express from 'express';
import prisma from '../db/prisma.js';
const router = express.Router();

// GET /api/map-locations
router.get('/map-locations', async (req, res) => {
  try {
    const locations = await prisma.pickupLocation.findMany({
      where: { is_active: true },
    });
    const response = locations.map(location => ({
      id: location.id,
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      open_hours: location.open_hours,
    }));
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
