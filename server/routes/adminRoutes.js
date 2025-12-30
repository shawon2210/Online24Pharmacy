 
import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, requireAdmin } from '../middleware/roleAuth.js';
import * as admin from '../controllers/adminController.js';
import prisma from '../db/prisma.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', admin.getDashboard);

// Image upload
router.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user);
    console.log('File:', req.file);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return the URL path to the uploaded file
    const fileUrl = `/uploads/products/${req.file.filename}`;
    console.log('Upload successful, returning URL:', fileUrl);
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Products
router.get('/products', admin.listProducts);
router.post('/products', admin.createProduct);
router.put('/products/:id', admin.updateProduct);

// Products by category - TODO: Implement these functions in adminController
// router.get('/products/category/:id', admin.listProductsByCategory);

// Products by subcategory - TODO: Implement these functions in adminController
// router.get('/products/subcategory/:id', admin.listProductsBySubcategory);

// Orders
router.get('/orders', admin.listOrders);
router.put('/orders/:id/status', admin.updateOrderStatus);

// Prescriptions
router.get('/prescriptions', admin.listPrescriptions);
router.put('/prescriptions/:id/review', admin.reviewPrescription);

// Inventory
router.get('/inventory', admin.getInventory);
router.put('/inventory', admin.updateInventory);

// Promotions
router.get('/promotions', admin.listPromotions);
router.post('/promotions', admin.createPromotion);

// Suppliers
router.get('/suppliers', admin.listSuppliers);
router.post('/suppliers', admin.addSupplier);
router.put('/suppliers/:id', admin.updateSupplier);

// Customers
router.get('/customers', admin.listCustomers);
router.put('/customers/:id/status', admin.toggleUserStatus);
router.get('/customers/:id/sessions', admin.getUserSessions);
router.delete('/sessions/:sessionId', admin.revokeSession);

// Admin Actions Audit
router.get('/audit-log', admin.getAdminActions);

// Analytics
router.get('/analytics', admin.getAnalytics);

// Pickup Locations
router.get('/pickup-locations', async (req, res) => {
  try {
    const locations = await prisma.pickupLocation.findMany({
      include: { inventory: true }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pickup locations' });
  }
});

router.post('/pickup-locations', async (req, res) => {
  try {
    const { name, address, lat, lng, open_hours, is_active } = req.body;
    const location = await prisma.pickupLocation.create({
      data: { 
        name, 
        address, 
        lat: parseFloat(lat), 
        lng: parseFloat(lng), 
        open_hours,
        is_active: is_active !== undefined ? is_active : true
      }
    });
    res.json(location);
  } catch (error) {
    console.error('Error creating pickup location:', error);
    res.status(500).json({ error: 'Failed to create pickup location' });
  }
});

router.put('/pickup-locations/:id', async (req, res) => {
  try {
    const { name, address, lat, lng, open_hours, is_active } = req.body;
    const location = await prisma.pickupLocation.update({
      where: { id: req.params.id },
      data: { name, address, lat: parseFloat(lat), lng: parseFloat(lng), open_hours, is_active }
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pickup location' });
  }
});

router.delete('/pickup-locations/:id', async (req, res) => {
  try {
    await prisma.pickupLocation.delete({ where: { id: req.params.id } });
    res.json({ message: 'Pickup location deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pickup location' });
  }
});

// Routes for category and subcategory creation
router.post('/category', admin.createCategory);
router.post('/subcategory', admin.createSubcategory);
router.post('/product', admin.createProduct);

// Error handler for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

export default router;