import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';

// Import module-specific admin routers
import productAdminRoutes from './admin/products.js';
import categoryAdminRoutes from './admin/categories.js';
import orderAdminRoutes from './admin/orders.js';
import customerAdminRoutes from './admin/customers.js';
import prescriptionAdminRoutes from './admin/prescriptions.js';

const router = Router();

// Secure all routes in this file with authentication and admin checks
router.use(authenticateToken, isAdmin);

// Health check endpoint for the admin API
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Admin API!',
    adminUser: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

// Use module-specific admin routers
router.use('/products', productAdminRoutes);
router.use('/categories', categoryAdminRoutes);
router.use('/orders', orderAdminRoutes);
router.use('/customers', customerAdminRoutes);
router.use('/prescriptions', prescriptionAdminRoutes);

export default router;