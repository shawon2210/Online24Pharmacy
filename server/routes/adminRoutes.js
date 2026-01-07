import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Import module-specific admin routers
import productAdminRoutes from './admin/products.js';
import categoryAdminRoutes from './admin/categories.js';
import orderAdminRoutes from './admin/orders.js';
import customerAdminRoutes from './admin/customers.js';
import prescriptionAdminRoutes from './admin/prescriptions.js';

const router = Router();

// Setup multer for image uploads
const uploadDir = path.resolve(process.cwd(), 'uploads', 'products');
await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

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

// Upload product image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Use module-specific admin routers
router.use('/products', productAdminRoutes);
router.use('/categories', categoryAdminRoutes);
router.use('/orders', orderAdminRoutes);
router.use('/customers', customerAdminRoutes);
router.use('/prescriptions', prescriptionAdminRoutes);

export default router;