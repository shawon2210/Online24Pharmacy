// linting: prefer no unused variables; fix or log instead of disabling rule
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.resolve(process.cwd(), 'data', 'users.json');

async function readUsersFile() {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('readUsersFile error:', e);
    return [];
  }
}

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('DEBUG: Incoming Authorization header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log('DEBUG: Extracted token:', token);

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    let decoded;
    try {
      decoded = jwt.verify(token, secret, { ignoreExpiration: true });
    } catch (e) {
      console.error('JWT verification failed:', e.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Support both 'userId' and 'id' fields
    const userId = decoded.userId || decoded.id;

    let user = null;
    
    // Check if userId is a valid UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
    
    // Try Prisma only for UUID format
    if (isUUID) {
      try {
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true
          }
        });
      } catch (_prismaError) {
        // Continue to file fallback
      }
    }

    // If not found in Prisma or non-UUID, check file fallback
    if (!user) {
      const users = await readUsersFile();
      user = users.find((u) => (u._id === userId) || (u.id === userId));
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = { 
      id: user.id || user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || decoded.role 
    };
    next();
  } catch (error) {
    console.error('AUTH: Unexpected error:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireAdmin = authorizeRoles(['ADMIN']);
export const requireDelivery = authorizeRoles(['DELIVERY', 'ADMIN']);
export const requireCustomer = authorizeRoles(['CUSTOMER', 'ADMIN']);