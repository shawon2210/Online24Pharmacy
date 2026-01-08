import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../../middleware/auth.js';
import { isAdmin } from '../../middleware/isAdmin.js';
import prisma from '../../db/prisma.js';
import { logAdminAction } from '../../utils/auditLogger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Setup multer for image uploads
const uploadDir = path.resolve(process.cwd(), 'uploads', 'categories');
await fs.mkdir(uploadDir, { recursive: true }).catch(() => {});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `category-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept all common image types
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp|ico|tiff|tif/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    // More specific error message
    const err = new Error(`Invalid file type. Only image files are allowed. You uploaded: ${file.mimetype}`);
    err.code = 'INVALID_FILE_TYPE';
    cb(err);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // Increased to 10MB
});

// POST /api/admin/categories/upload - Upload category image (BEFORE auth middleware)
router.post('/upload', authenticateToken, isAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
      }
      
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: err.message });
      }
      
      return res.status(500).json({ error: err.message || 'Upload failed' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const imageUrl = `/uploads/categories/${req.file.filename}`;
      console.log('Category image uploaded successfully:', imageUrl);
      res.json({ imageUrl });
    } catch (error) {
      console.error('Upload processing failed:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  });
});

// Apply auth and admin middleware ONLY to routes below this line
router.use(authenticateToken, isAdmin);

// Validation middleware
const validateCategory = [
  body('name').notEmpty().withMessage('Category name is required.'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens.'),
];

const validateSubcategory = [
  body('name').notEmpty().withMessage('Subcategory name is required.'),
  body('categoryId').notEmpty().withMessage('Parent category ID is required.'),
];

// GET /api/admin/categories/all - Fetch all active categories for forms
router.get('/all', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    res.json(categories);
  } catch (_error) {
    console.error('Failed to fetch all categories:', _error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/admin/categories - List all active categories for management
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    res.json({ categories });
  } catch (_error) {
    console.error('Failed to fetch categories:', _error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// POST /api/admin/categories - Create a new category
router.post('/', validateCategory, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, slug, description, image, subcategories, _brands, _productTypes, _variants } = req.body;
  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        imageUrl: image,
        isActive: true,
      },
    });

    if (subcategories && Array.isArray(subcategories) && subcategories.length > 0) {
      await Promise.all(
        subcategories.map((subName) =>
          prisma.subcategory.create({
            data: {
              name: subName,
              slug: subName.toLowerCase().replace(/\s+/g, '-'),
              categoryId: newCategory.id,
              isActive: true,
            },
          })
        )
      );
    }

    await logAdminAction({
      adminId: req.user.id,
      action: 'CREATE_CATEGORY',
      targetId: newCategory.id,
      details: { data: newCategory },
      ipAddress: req.ip,
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Failed to create category:', error);
    res.status(500).json({ error: error.message || 'Failed to create category.' });
  }
});

// PUT /api/admin/categories/:id - Update a category
router.put('/:id', validateCategory, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, slug, description, image, sortOrder } = req.body;
  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl: image,
        isActive: true,
        sortOrder,
      },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_CATEGORY',
      targetId: id,
      details: { changes: req.body },
      ipAddress: req.ip,
    });
    res.json(updatedCategory);
  } catch (error) {
    console.error('Failed to update category:', error);
    res.status(500).json({ error: error.message || 'Failed to update category.' });
  }
});

// DELETE /api/admin/categories/:id - Soft delete a category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: 'DEACTIVATE_CATEGORY',
      targetId: id,
      ipAddress: req.ip,
    });
    res.json({ success: true });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// POST /api/admin/categories/subcategory - Create a new subcategory
router.post('/subcategory', validateSubcategory, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, slug, description, categoryId, isActive } = req.body;
  try {
    const newSubcategory = await prisma.subcategory.create({
      data: { name, slug, description, categoryId, isActive },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: 'CREATE_SUBCATEGORY',
      targetId: newSubcategory.id,
      details: { data: newSubcategory },
      ipAddress: req.ip,
    });
    res.status(201).json(newSubcategory);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create subcategory.' });
  }
});

// PUT /api/admin/categories/subcategory/:id - Update a subcategory
router.put('/subcategory/:id', async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, isActive, sortOrder } = req.body;
  try {
    const updatedSubcategory = await prisma.subcategory.update({
      where: { id },
      data: { name, slug, description, isActive, sortOrder },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_SUBCATEGORY',
      targetId: id,
      details: { changes: req.body },
      ipAddress: req.ip,
    });
    res.json(updatedSubcategory);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update subcategory.' });
  }
});

// DELETE /api/admin/categories/subcategory/:id - Soft delete a subcategory
router.delete('/subcategory/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.subcategory.update({
      where: { id },
      data: { isActive: false },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: 'DEACTIVATE_SUBCATEGORY',
      targetId: id,
      ipAddress: req.ip,
    });
    res.json({ success: true });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete subcategory.' });
  }
});

export default router;
