import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken } from '../middleware/roleAuth.js';
import prisma from '../db/prisma.js';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), 'uploads', 'prescriptions');
await fs.mkdir(uploadDir, { recursive: true }).catch((e) => { console.error('Create upload dir error:', e); });

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, 'prescriptions.json');
const REORDERS_FILE = path.join(DATA_DIR, 'prescription-reorders.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'prescription-reminders.json');

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function computeDerivedStatus(prescription) {
  const base = (prescription.status || 'PENDING').toUpperCase();
  const now = new Date();
  const issuedAt = prescription.prescriptionDate
    ? new Date(prescription.prescriptionDate)
    : null;
  const expiresAt = prescription.expiresAt
    ? new Date(prescription.expiresAt)
    : issuedAt
    ? new Date(issuedAt.getTime() + 180 * 24 * 60 * 60 * 1000)
    : null;

  let derived = base;
  if (expiresAt) {
    const diffDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) {
      derived = 'EXPIRED';
    } else if (diffDays <= 14) {
      derived = 'EXPIRING';
    } else if (base === 'PENDING' || base === 'APPROVED') {
      derived = 'ACTIVE';
    }
  }

  const isReorderable = prescription.isReorderable ?? (derived !== 'EXPIRED' && base !== 'REJECTED');

  return {
    ...prescription,
    expiresAt: expiresAt ? expiresAt.toISOString() : prescription.expiresAt,
    derivedStatus: derived,
    isReorderable,
  };
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `rx-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image and PDF files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload', authenticateToken, (req, res, next) => {
  const handler = upload.single('prescription');
  handler(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/prescriptions/${req.file.filename}`;
    res.json({ fileUrl, status: 'under-review' });
  });
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      doctorName, 
      hospitalClinic, 
      prescriptionDate, 
      prescriptionImage, 
      items,
      patientName,
      patientAge,
      patientPhone,
      patientAddress
    } = req.body;
    const userId = req.user.id;

    if (!prescriptionImage) {
      return res.status(400).json({ error: 'Prescription image is required' });
    }

    // Generate reference number
    const referenceNumber = `RX${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const issueDate = prescriptionDate ? new Date(prescriptionDate) : new Date();
    const expiresAt = new Date(issueDate);
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    let created;
    try {
      created = await prisma.prescription.create({
        data: {
          referenceNumber,
          userId,
          prescriptionImage,
          patientName,
          patientAge: patientAge ? parseInt(patientAge) : null,
          patientPhone,
          patientAddress,
          doctorName,
          hospitalClinic,
          prescriptionDate: issueDate,
          expiresAt,
          isReorderable: true,
          status: 'PENDING',
          items: items ? JSON.stringify(items) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      });
    } catch (prismaError) {
      console.error('Prisma error:', prismaError.message);
      // Fallback to file storage when Prisma is unavailable
      const prescriptions = await readJson(PRESCRIPTIONS_FILE);
      created = {
        id: Date.now().toString(),
        referenceNumber,
        userId,
        prescriptionImage,
        patientName,
        patientAge: patientAge ? parseInt(patientAge) : null,
        patientPhone,
        patientAddress,
        doctorName,
        hospitalClinic,
        prescriptionDate: issueDate.toISOString(),
        expiresAt: expiresAt.toISOString(),
        isReorderable: true,
        status: 'PENDING',
        items: items || [],
        createdAt: new Date().toISOString(),
      };
      prescriptions.unshift(created);
      await writeJson(PRESCRIPTIONS_FILE, prescriptions);
    }

    const result = computeDerivedStatus(created);
    res.status(201).json({ ...result, referenceNumber: created.referenceNumber || referenceNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit prescription' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let prescriptions = [];

    try {
      prescriptions = await prisma.prescription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (prismaError) {
      console.error('Prisma error while fetching prescriptions:', prismaError);
      const filePrescriptions = await readJson(PRESCRIPTIONS_FILE);
      prescriptions = filePrescriptions.filter(p => p.userId === userId);
    }

    const prescriptionsWithStatus = prescriptions
      .map(computeDerivedStatus)
      .sort((a, b) => new Date(b.createdAt || b.prescriptionDate || 0) - new Date(a.createdAt || a.prescriptionDate || 0));

    res.json({ prescriptions: prescriptionsWithStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

router.post('/:id/reorder', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    let prescription;

    try {
      prescription = await prisma.prescription.findUnique({
        where: { id, userId }
      });
    } catch (prismaError) {
      console.error('Prisma error while fetching prescription:', prismaError);
      const prescriptions = await readJson(PRESCRIPTIONS_FILE);
      prescription = prescriptions.find(p => p.id === id && p.userId === userId);
    }

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    const derived = computeDerivedStatus(prescription);
    if (!derived.isReorderable || derived.derivedStatus === 'EXPIRED') {
      return res.status(403).json({ error: 'Prescription is expired or not reorderable' });
    }

    // Parse items from prescription
    let items = [];
    if (prescription.items) {
      try {
        const parsed = typeof prescription.items === 'string' ? JSON.parse(prescription.items) : prescription.items;
        // Filter out invalid items (image paths, etc)
        if (Array.isArray(parsed)) {
          items = parsed.filter(item => 
            item && typeof item === 'object' && item.productId
          );
        }
      } catch (e) {
        console.error('Failed to parse prescription items:', e);
        items = [];
      }
    }

    // If no valid items, fetch products from database
    if (!items.length) {
      try {
        const products = await prisma.product.findMany({ 
          where: { isActive: true },
          take: 3 
        });
        items = products.map(p => ({ productId: p.id, name: p.name, quantity: 1 }));
      } catch (e) {
        console.error('Failed to fetch products for reorder:', e);
        return res.status(400).json({ error: 'No medicines available to add to cart' });
      }
    }

    if (!items.length) {
      return res.status(400).json({ error: 'No medicines found in prescription' });
    }

    let addedCount = 0;
    try {
      for (const item of items) {
        const { productId, quantity = 1 } = item;
        if (!productId) continue;

        const existing = await prisma.cartItem.findUnique({
          where: { userId_productId: { userId, productId } }
        });

        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity }
          });
        } else {
          await prisma.cartItem.create({
            data: { userId, productId, quantity }
          });
        }
        addedCount++;
      }
    } catch (prismaError) {
      console.error('Cart error:', prismaError);
      return res.status(500).json({ error: 'Failed to add items to cart' });
    }

    res.json({ 
      success: true, 
      message: `${addedCount} medicine(s) added to your cart successfully!` 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reorder prescription' });
  }
});

// Store reminder request (3 days before expiry by default)
router.post('/:id/reminder', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const notifyBeforeDays = Number(req.body?.notifyBeforeDays ?? 3);

    let prescription;
    try {
      prescription = await prisma.prescription.findUnique({ where: { id, userId } });
    } catch (prismaError) {
      console.error('Prisma error while fetching prescription for reminder:', prismaError);
      const prescriptions = await readJson(PRESCRIPTIONS_FILE);
      prescription = prescriptions.find(p => p.id === id && p.userId === userId);
    }

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    const reminders = await readJson(REMINDERS_FILE);
    const reminder = {
      id: `reminder_${Date.now()}`,
      prescriptionId: id,
      userId,
      notifyBeforeDays: Number.isFinite(notifyBeforeDays) ? notifyBeforeDays : 3,
      createdAt: new Date().toISOString(),
      message: `Your prescription for ${prescription.medicationName || 'medicine'} expires soon. Reorder now?`
    };
    reminders.unshift(reminder);
    await writeJson(REMINDERS_FILE, reminders);

    res.json({ success: true, reminderId: reminder.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

export default router;

