/**
 * ============================================
 * AUTHENTICATION CONTROLLER
 * ============================================
 * 
 * Handles user authentication, registration, and session management
 * Supports dual storage: file-based (legacy) and Prisma (primary)
 * Implements JWT-based authentication with refresh tokens
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.resolve(process.cwd(), 'data', 'users.json');

/**
 * Read users from legacy JSON file
 * Fallback mechanism for backward compatibility
 * @returns {Promise<Array>} Array of user objects
 */
async function readUsersFile() {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('readUsersFile error:', e);
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, '[]');
    return [];
  }
}

/**
 * ============================================
 * TOKEN GENERATION
 * ============================================
 */

/**
 * Generate JWT access and refresh tokens
 * Access tokens expire in 12h (admin) or 24h (customer)
 * Refresh tokens expire in 7d (admin) or 30d (customer)
 * 
 * @param {string} userId - User's unique identifier
 * @param {string} role - User role (ADMIN, CUSTOMER, etc.)
 * @param {string} email - User's email address
 * @returns {{accessToken: string, refreshToken: string}} Token pair
 */
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
    process.env.JWT_SECRET,
    { expiresIn: role === 'ADMIN' ? '12h' : '24h' }
  );
  
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: role === 'ADMIN' ? '7d' : '30d' }
  );
  
  return { accessToken, refreshToken };
};

/**
 * ============================================
 * AUTHENTICATION ENDPOINTS
 * ============================================
 */

/**
 * User login endpoint
 * Supports dual authentication: file-based (legacy) and Prisma database
 * Implements security logging and session management
 * 
 * @route POST /api/auth/login
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password (plain text, will be compared with hash)
 * @returns {Object} User object and access token
 * @throws {401} Invalid credentials or inactive account
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    console.info('Login attempt', { email, ipAddress, userAgent });

    let user = null;

    // Try file-based users first (legacy fallback)
    try {
      const fileUsers = await readUsersFile();
      const fileUser = fileUsers.find(u => u.email === email);
      if (fileUser) {
        user = {
          id: fileUser._id || fileUser.id,
          email: fileUser.email,
          firstName: fileUser.firstName,
          lastName: fileUser.lastName,
          passwordHash: fileUser.passwordHash,
          role: fileUser.role || 'CUSTOMER',
          isActive: fileUser.isActive !== false
        };
      }
    } catch (fileError) {
      console.error('File-based user lookup failed:', fileError.message);
    }

    // Fallback to Prisma database if file lookup didn't find user
    if (!user) {
      try {
        user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            passwordHash: true,
            role: true,
            isActive: true
          }
        });
      } catch (prismaError) {
        console.error('Prisma lookup failed:', prismaError.message);
      }
    }

    console.log('DEBUG: user object before bcrypt.compare:', user);
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive && user.isActive !== undefined) {
      return res.status(403).json({ error: 'Account disabled by administrator' });
    }

    const userId = user.id || user._id;
    const { accessToken, refreshToken } = generateTokens(userId, user.role, user.email);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: (user.role === 'ADMIN' ? 7 : 30) * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * User registration endpoint
 * Creates new user account with hashed password
 * Auto-assigns role based on email pattern (admin@, delivery@)
 * 
 * @route POST /api/auth/signup
 * @param {Object} req.body - Registration data
 * @param {string} req.body.email - User email (unique)
 * @param {string} req.body.phone - Phone number (unique)
 * @param {string} req.body.password - Plain text password (will be hashed)
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @returns {Object} Created user object and access token
 * @throws {400} User already exists
 */
export const signup = async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    console.info('Signup attempt', { email, ipAddress, userAgent });

    try {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
        select: { id: true }
      });
      if (existingUser) return res.status(400).json({ error: 'User already exists' });

      // Hash password with bcrypt (12 rounds for security)
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Auto-assign role based on email pattern
      const role = email.includes('admin') ? 'ADMIN' : email.includes('delivery') ? 'DELIVERY_PARTNER' : 'USER';
      const user = await prisma.user.create({
        data: { email, phone, passwordHash, firstName, lastName, role },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
      });

      const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.email);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: (role === 'ADMIN' ? 7 : 30) * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({ user, accessToken });
    } catch (e) {
      console.error('Signup database error:', e);
      return res.status(500).json({ error: 'Database error' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Refresh access token endpoint
 * Validates refresh token and issues new access token
 * Checks for revoked sessions and inactive users
 * 
 * @route POST /api/auth/refresh
 * @param {Object} req.cookies - HTTP-only cookies
 * @param {string} req.cookies.refreshToken - Refresh token from cookie
 * @returns {Object} New access token
 * @throws {401} Invalid or revoked refresh token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    console.info('Refreshing token', { ipAddress, userAgent });

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const session = await prisma.session.findUnique({ where: { refreshToken } });
    if (session?.isRevoked) {
      return res.status(401).json({ error: 'Session revoked' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role, user.email);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: (user.role === 'ADMIN' ? 7 : 30) * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * User logout endpoint
 * Revokes refresh token session and clears cookies
 * Gracefully handles errors to ensure logout always succeeds
 * 
 * @route POST /api/auth/logout
 * @param {Object} req.cookies - HTTP-only cookies
 * @param {string} req.cookies.refreshToken - Refresh token to revoke
 * @returns {Object} Success message
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    // Revoke session in database if refresh token exists
    if (refreshToken) {
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { isRevoked: true }
      });
    }
    
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
      // Always succeed logout even if database operation fails
      console.error(error);
      res.clearCookie('refreshToken');
      res.json({ message: 'Logged out successfully' });
  }
};