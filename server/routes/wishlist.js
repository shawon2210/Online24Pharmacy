import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();

// Get user wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: { category: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(wishlistItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId
      },
      include: { product: true }
    });

    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: req.params.productId
        }
      }
    });

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;