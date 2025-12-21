import express from 'express';
const router = express.Router();

// Apply coupon
router.post('/apply', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    // Mock coupon validation - in production, use database
    const coupons = {
      'FIRST10': { type: 'percentage', value: 10, minAmount: 100 },
      'SAVE50': { type: 'fixed', value: 50, minAmount: 500 },
      'HEALTH20': { type: 'percentage', value: 20, minAmount: 200 }
    };

    const coupon = coupons[code];
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    if (cartTotal < coupon.minAmount) {
      return res.status(400).json({ 
        error: `Minimum order amount ৳${coupon.minAmount} required` 
      });
    }

    const discount = coupon.type === 'percentage' 
      ? (cartTotal * coupon.value) / 100 
      : coupon.value;

    res.json({
      code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.min(discount, cartTotal),
      minAmount: coupon.minAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

export default router;