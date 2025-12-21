import express from 'express';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/roleAuth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    res.json({ reviews: [], averageRating: 0, totalReviews: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating) return res.status(400).json({ error: 'productId and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });

    // Check if user has purchased this product to set isVerified
    let hasPurchased = false;
    try {
      const purchased = await prisma.orderItem.findFirst({
        where: { productId, order: { userId: req.user.id, status: 'delivered' } }
      });
      hasPurchased = !!purchased;
    } catch (err) { console.error('Purchase lookup failed:', err); }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating,
        comment,
        isVerified: hasPurchased,
        status: 'pending'
      },
      include: { user: { select: { firstName: true, lastName: true } } }
    });

    res.status(201).json({ review, moderation: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Admin: list pending reviews with pagination
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { status: 'pending' },
        include: { user: { select: { firstName: true, lastName: true } }, product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: { status: 'pending' } })
    ]);

    res.json({ reviews, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
});

// Admin: update status
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const updated = await prisma.review.update({ where: { id: req.params.id }, data: { status } });
    res.json({ id: updated.id, status: updated.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

// Admin: get review stats
router.get('/stats', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const [total, approved, rejected, pending, avgRating] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { status: 'approved' } }),
      prisma.review.count({ where: { status: 'rejected' } }),
      prisma.review.count({ where: { status: 'pending' } }),
      prisma.review.aggregate({ _avg: { rating: true } })
    ]);
    res.json({
      total,
      approved,
      rejected,
      pending,
      avgRating: avgRating._avg.rating || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;