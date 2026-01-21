import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret';

const generateTokens = (userId, role, email) => {
  const payload = {
    id: userId,
    userId,
    role: role || 'USER',
    email,
    type: 'access',
    iat: Math.floor(Date.now() / 1000)
  };
  
  const accessToken = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: role === 'ADMIN' ? '12h' : '24h' }
  );
  
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: role === 'ADMIN' ? '7d' : '30d' }
  );
  
  return { accessToken, refreshToken };
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
    const decoded = jwt.verify(token, JWT_SECRET);
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
            role: fileUser.role || 'USER',
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
    if (error.name === 'TokenExpiredError') {
      // Attempt to refresh token using refresh token from cookies
      try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
          const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret');
          const session = await prisma.session.findUnique({ where: { refreshToken } });
          if (!session?.isRevoked) {
            const user = await prisma.user.findUnique({
              where: { id: decodedRefresh.userId },
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
            if (user && user.isActive) {
              const { accessToken: _accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role, user.email);
              // Update session with new refresh token
              await prisma.session.updateMany({
                where: { refreshToken },
                data: { refreshToken: newRefreshToken, updatedAt: new Date() }
              });
              res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: (user.role === 'ADMIN' ? 7 : 30) * 24 * 60 * 60 * 1000
              });
              // Set the new access token in the request for this call
              req.user = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified
              };
              return next();
            }
          }
        }
      } catch (refreshError) {
        console.error('AUTH: Refresh failed:', refreshError.message);
      }
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};
