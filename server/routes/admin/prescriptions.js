import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../db/prisma.js';
import { logAdminAction } from '../../utils/auditLogger.js';

const router = Router();

// GET /api/admin/prescriptions - List all prescriptions with filtering and pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, status = 'PENDING' } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  try {
    const where = status ? { status } : {};

    const prescriptions = await prisma.prescription.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const totalPrescriptions = await prisma.prescription.count({ where });

    res.json({
      data: prescriptions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPrescriptions / limitNum),
        totalItems: totalPrescriptions,
      },
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch prescriptions.' });
  }
});

// POST /api/admin/prescriptions/:id/approve - Approve a prescription
router.post('/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: 'APPROVED',
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
      },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: 'APPROVE_PRESCRIPTION',
      targetType: 'Prescription',
      targetId: id,
      ipAddress: req.ip,
    });

    // TODO: Send notification to user

    res.json(updatedPrescription);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to approve prescription.' });
  }
});

// POST /api/admin/prescriptions/:id/reject - Reject a prescription
router.post('/:id/reject', [body('notes').notEmpty().withMessage('Rejection notes are required.')], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { notes } = req.body;

  try {
    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNotes: notes,
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
      },
    });

    await logAdminAction({
      adminId: req.user.id,
      action: 'REJECT_PRESCRIPTION',
      targetType: 'Prescription',
      targetId: id,
      details: { notes },
      ipAddress: req.ip,
    });

    // TODO: Send notification to user

    res.json(updatedPrescription);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to reject prescription.' });
  }
});

export default router;

