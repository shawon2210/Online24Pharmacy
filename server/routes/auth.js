import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;

    // Try file-based users first (more reliable)
    try {
      const usersData = await fs.readFile(path.resolve(process.cwd(), 'data', 'users.json'), 'utf8').catch(() => '[]');
      const fileUsers = JSON.parse(usersData);
      const fileUser = fileUsers.find(u => u.email === email);
      if (fileUser) {
        user = {
          id: fileUser._id || fileUser.id,
          email: fileUser.email,
          firstName: fileUser.firstName,
          lastName: fileUser.lastName,
          passwordHash: fileUser.passwordHash || fileUser.password,
          role: fileUser.role
        };
      }
    } catch (fileError) {
      console.error('File-based user lookup failed:', fileError);
    }

    // Fallback to Prisma if file lookup failed
    if (!user) {
      try {
        user = await prisma.user.findUnique({
          where: { email }
        });
      } catch (prismaError) {
        console.error('Prisma user lookup failed:', prismaError.message);
        // Both lookups failed, user will be null
      }
    }

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken: token,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;