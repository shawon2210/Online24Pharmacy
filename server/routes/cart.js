import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();

// Get cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true }
    });
    res.json({ items: cartItems });
  } catch (error) {
    console.error(error);
    res.json({ items: [] });
  }
});

// Update cart item quantity
router.patch('/', authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: parseInt(quantity) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove cart item
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    await prisma.cartItem.delete({
      where: { id: req.params.itemId }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Add to cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    await prisma.cartItem.create({
      data: { userId: req.user.id, productId, quantity }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

export default router;
