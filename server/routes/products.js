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

const normalizeImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed;
    return [String(parsed)];
  } catch (_err) {
    return [images];
  }
};

// Get all products with filters (public catalog)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      categoryId,
      subcategoryId,
      requiresPrescription,
      isOTC,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * take;

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;

    if (requiresPrescription === 'true') where.requiresPrescription = true;
    if (requiresPrescription === 'false') where.requiresPrescription = false;

    if (isOTC === 'true') where.isOTC = true;
    if (isOTC === 'false') where.isOTC = false;

    const orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    const normalized = products.map((product) => {
      const images = normalizeImages(product.images);
      return {
        ...product,
        images,
        image: images[0] || null,
      };
    });

    res.json({
      products: normalized,
      total,
      page: pageNumber,
      limit: take,
      pages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.json({ products: [], total: 0, page: 1, limit: 20, pages: 0 });
  }
});

// Get all categories (public)
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
      },
    });

    res.json({ categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.json({ categories: [] });
  }
});

// Get products grouped by category for homepage
router.get('/categories/with-products', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const productLimit = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 20);

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
      },
    });

    // For each category, fetch products
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await prisma.product.findMany({
          where: {
            isActive: true,
            categoryId: category.id,
          },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: productLimit,
        });

        return {
          ...category,
          products: products.map(p => ({
            ...p,
            images: normalizeImages(p.images),
          })),
          productCount: products.length,
        };
      })
    );

    // Only return categories that have products
    const categoriesWithProductsFiltered = categoriesWithProducts.filter(
      cat => cat.productCount > 0
    );

    res.json({ categories: categoriesWithProductsFiltered });
  } catch (error) {
    console.error('Failed to fetch categories with products:', error);
    res.status(500).json({ error: 'Failed to fetch categories with products' });
  }
});

// Get all subcategories (public)
router.get('/subcategories', async (_req, res) => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        categoryId: true,
      },
    });

    res.json({ subcategories });
  } catch (error) {
    console.error('Failed to fetch subcategories:', error);
    res.json({ subcategories: [] });
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

// Get single product by slug or id
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        isActive: true,
        OR: [{ slug: req.params.slug }, { id: req.params.slug }],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = normalizeImages(product.images);
    res.json({
      ...product,
      images,
      image: images[0] || null,
    });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Restrict direct mutations on public products API
router.post('/', (_req, res) => {
  res.status(403).json({ error: 'Product creation is restricted. Use /api/admin/products.' });
});

router.put('/:id', (_req, res) => {
  res.status(403).json({ error: 'Product updates are restricted. Use /api/admin/products/:id.' });
});

router.delete('/:id', (_req, res) => {
  res.status(403).json({ error: 'Product deletion is restricted. Use /api/admin/products/:id.' });
});

export default router;

