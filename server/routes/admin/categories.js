import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../db/prisma.js';
import { logAdminAction } from '../../utils/auditLogger.js';

const router = Router();

// Validation middleware
const validateCategory = [
  body('name').notEmpty().withMessage('Category name is required.'),
  body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens.'),
];

const validateSubcategory = [
  body('name').notEmpty().withMessage('Subcategory name is required.'),
  body('categoryId').notEmpty().withMessage('Parent category ID is required.'),
];

// GET /api/admin/categories/all - Fetch all active categories and their subcategories for forms
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

// GET /api/admin/categories - List all categories for management
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    res.json(categories);
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

  const { name, slug, description, imageUrl, isActive } = req.body;
  try {
    const newCategory = await prisma.category.create({
      data: { name, slug, description, imageUrl, isActive },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: 'CREATE_CATEGORY',
      targetId: newCategory.id,
      details: { data: newCategory },
      ipAddress: req.ip,
    });
    res.status(201).json(newCategory);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create category.' });
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

// PUT /api/admin/categories/:id - Update a category
router.put('/:id', validateCategory, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, slug, description, imageUrl, isActive, sortOrder } = req.body;
  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, slug, description, imageUrl, isActive, sortOrder },
    });
    await logAdminAction({
      adminId: req.user.id,
      action: 'UPDATE_CATEGORY',
      targetId: id,
      details: { changes: req.body },
      ipAddress: req.ip,
    });
    res.json(updatedCategory);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update category.' });
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

// PUT /api/admin/categories/reorder - Reorder categories and subcategories
router.put('/reorder', async (req, res) => {
    const { categories } = req.body; // Expects an array of categories with subcategories
    try {
      const transaction = [];
      categories.forEach((category, catIndex) => {
        transaction.push(prisma.category.update({
          where: { id: category.id },
          data: { sortOrder: catIndex },
        }));
        category.subcategories.forEach((subcategory, subIndex) => {
          transaction.push(prisma.subcategory.update({
            where: { id: subcategory.id },
            data: { sortOrder: subIndex, categoryId: category.id },
          }));
        });
      });
  
      await prisma.$transaction(transaction);
      
      await logAdminAction({
        adminId: req.user.id,
        action: 'REORDER_CATEGORIES',
        ipAddress: req.ip,
      });

      res.status(200).json({ message: 'Reordering successful.' });
    } catch (_error) {
      console.error('Reordering failed:', _error);
      res.status(500).json({ error: 'Failed to reorder categories.' });
    }
  });

// DELETE /api/admin/categories/:id - "Soft delete" a category
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
    res.status(204).send();
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// DELETE /api/admin/categories/subcategory/:id - "Soft delete" a subcategory
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
      res.status(204).send();
    } catch (_error) {
      res.status(500).json({ error: 'Failed to delete subcategory.' });
    }
  });

export default router;

