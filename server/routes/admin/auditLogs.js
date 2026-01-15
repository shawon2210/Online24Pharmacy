import { Router } from 'express';
import prisma from '../../db/prisma.js';

const router = Router();

// GET /api/admin/audit-logs - List admin audit logs with search, filter, and pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 15, search = '', action = '', adminId = '' } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  try {
    const where = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { targetType: { contains: search, mode: 'insensitive' } },
        { targetId: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { admin: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (adminId) {
      where.adminId = adminId;
    }

    const auditLogs = await prisma.adminLog.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const totalLogs = await prisma.adminLog.count({ where });

    res.json({
      data: auditLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalLogs,
        pages: Math.ceil(totalLogs / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;