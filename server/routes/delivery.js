import express from 'express';

const router = express.Router();

const coverageAreas = {
  'dhanmondi': { name: 'Dhanmondi', deliveryTime: '2-4 hours', fee: 0, coordinates: [90.3750, 23.7550] },
  'gulshan': { name: 'Gulshan', deliveryTime: '2-4 hours', fee: 0, coordinates: [90.4150, 23.7850] },
  'banani': { name: 'Banani', deliveryTime: '2-4 hours', fee: 0, coordinates: [90.4075, 23.7950] },
  'uttara': { name: 'Uttara', deliveryTime: '3-6 hours', fee: 0, coordinates: [90.4000, 23.8700] },
  'mirpur': { name: 'Mirpur', deliveryTime: '3-6 hours', fee: 0, coordinates: [90.3650, 23.8100] },
  'mohammadpur': { name: 'Mohammadpur', deliveryTime: '2-4 hours', fee: 0, coordinates: [90.3600, 23.7650] },
  'bashundhara': { name: 'Bashundhara', deliveryTime: '3-6 hours', fee: 0, coordinates: [90.4250, 23.8200] },
  'motijheel': { name: 'Motijheel', deliveryTime: '2-4 hours', fee: 0, coordinates: [90.4175, 23.7330] }
};

router.get('/coverage', (req, res) => {
  const { area } = req.query;
  
  if (!area) {
    return res.status(400).json({ error: 'Area parameter is required' });
  }

  const normalizedArea = area.toLowerCase().trim();
  const coverage = coverageAreas[normalizedArea];

  if (coverage) {
    res.json({
      area: coverage.name,
      isCovered: true,
      estimatedDelivery: coverage.deliveryTime,
      deliveryFee: coverage.fee,
      message: `Free delivery in ${coverage.name}!`,
      coordinates: coverage.coordinates
    });
  } else {
    res.json({
      area: area,
      isCovered: false,
      message: `Sorry, we don't deliver to ${area} yet. We're expanding soon!`
    });
  }
});

export default router;
