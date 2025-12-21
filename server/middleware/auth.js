import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    console.log('AUTH: Looking for userId:', decoded.userId);
    
    let user = null;
    
    // Check if userId is a valid UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decoded.userId);
    
    if (isUUID) {
      try {
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            isVerified: true
          }
        });
      } catch (prismaError) {
        console.log('AUTH: Prisma error:', prismaError.message);
      }
    }
    
    // Fallback to file-based users for non-UUID IDs
    if (!user) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const USERS_FILE = path.resolve(process.cwd(), 'data', 'users.json');
        const fileData = await fs.readFile(USERS_FILE, 'utf8');
        const fileUsers = JSON.parse(fileData || '[]');
        console.log('AUTH: Checking file with', fileUsers.length, 'users');
        
        const fileUser = fileUsers.find(u => (u.id || u._id) === decoded.userId);
        if (fileUser) {
          user = {
            id: fileUser.id || fileUser._id,
            email: fileUser.email,
            firstName: fileUser.firstName,
            lastName: fileUser.lastName,
            role: fileUser.role || 'CUSTOMER',
            isActive: fileUser.isActive !== false,
            isVerified: fileUser.isVerified !== false
          };
        }
      } catch (fileError) {
        console.log('AUTH: File lookup failed:', fileError.message);
      }
    }

    if (!user) {
      console.log('AUTH: User not found');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('AUTH: Token verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};