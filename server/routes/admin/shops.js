import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/isAdmin.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// List all shops
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({ orderBy: { id: 'desc' } });
    res.json(shops);
  } catch (_err) {
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Create a new shop
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, address, open_hours, lat, lng } = req.body;
    if (!name || !address) return res.status(400).json({ error: 'Name and address required' });
    const shop = await prisma.shop.create({
      data: {
        name,
        address,
        open_hours,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
      },
    });
    res.status(201).json(shop);
  } catch (_err) {
    res.status(500).json({ error: 'Failed to create shop' });
  }
});

export default router;
