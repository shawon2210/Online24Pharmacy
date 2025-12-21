/* eslint-disable no-unused-vars */
import express from 'express';
import prisma from '../db/prisma.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Setup multer for image uploads
const uploadDir = path.resolve(process.cwd(), 'uploads', 'products');
await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
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

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'products.json');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const products = JSON.parse(data || '[]');
      res.json({ products, pagination: { page: 1, limit: 20, total: products.length, pages: 1 } });
    } catch (e) {
      res.json({ products: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
    }
  } catch (error) {
    console.error(error);
    res.json({ products: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
  }
});

// Get all categories (from data file) - MUST BE BEFORE /:slug route
router.get('/categories', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'categories.json');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const categories = JSON.parse(data || '[]');
      res.json({ categories });
    } catch (e) {
      res.json({ categories: [] });
    }
  } catch (error) {
    console.error(error);
    res.json({ categories: [] });
  }
});

// Get all subcategories (from data file) - MUST BE BEFORE /:slug route
router.get('/subcategories', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'subcategories.json');
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const subcategories = JSON.parse(data || '[]');
      res.json({ subcategories });
    } catch (e) {
      res.json({ subcategories: [] });
    }
  } catch (error) {
    console.error(error);
    res.json({ subcategories: [] });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'products.json');
    const data = await fs.readFile(filePath, 'utf8');
    const products = JSON.parse(data || '[]');
    const product = products.find(p => p.slug === req.params.slug);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Upload product image (must be before /:slug route)
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, category, price, stock, image, description } = req.body;
    const product = { id: Date.now().toString(), name, category, price: parseFloat(price), stock: parseInt(stock), image, description };
    
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'products.json');
    
    let products = [];
    try {
      const data = await fs.readFile(filePath, 'utf8');
      products = JSON.parse(data || '[]');
    } catch (e) { console.error(e); /* intentionally ignored fallback read error */ }
    
    products.push(product);
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, category, price, stock, image, description } = req.body;
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'products.json');
    
    const data = await fs.readFile(filePath, 'utf8');
    let products = JSON.parse(data || '[]');
    const index = products.findIndex(p => p.id === req.params.id);
    
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    products[index] = { ...products[index], name, category, price: parseFloat(price), stock: parseInt(stock), image, description };
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
    res.json(products[index]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(process.cwd(), 'server', 'data', 'products.json');
    
    const data = await fs.readFile(filePath, 'utf8');
    let products = JSON.parse(data || '[]');
    products = products.filter(p => p.id !== req.params.id);
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;