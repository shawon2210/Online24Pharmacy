import express from 'express';
import { authenticateToken } from '../middleware/roleAuth.js';
import prisma from '../db/prisma.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// File paths for fallback storage
const USERS_FILE = path.resolve(process.cwd(), 'data', 'users.json');

async function readUsersFile() {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error(e);
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, '[]');
    return [];
  }
}

async function writeUsersFile(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Update user profile
router.patch('/me', authenticateToken, async (req, res) => {
  try {
    const { fullName, phoneNumber, dateOfBirth, gender, street, area, city, postalCode } = req.body;
    const userId = req.user.id || req.user._id;

    // Validate phone number (only if provided and not empty)
    const phoneRegex = /^\+8801[3-9]\d{8}$/;
    if (phoneNumber && phoneNumber.trim() !== '' && !phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number. Must be 11 digits and start with 01 (e.g., 01712345678)' });
    }

    // Parse full name
    const nameParts = fullName?.split(' ') || [];
    const firstName = nameParts[0] || req.user.firstName;
    const lastName = nameParts.slice(1).join(' ') || req.user.lastName;

    let updatedUser;

    try {
      // Try Prisma first
      // Check if phone is already taken by another user
      if (phoneNumber && phoneNumber.trim() !== '') {
        const existingUser = await prisma.user.findFirst({
          where: {
            phone: phoneNumber,
            NOT: { id: userId }
          }
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Phone number already in use' });
        }
      }

      // Build update data
      const updateData = {
        firstName,
        lastName,
        gender
      };

      // Only update phone if provided
      if (phoneNumber && phoneNumber.trim() !== '') {
        updateData.phone = phoneNumber;
      }

      // Only update dateOfBirth if provided
      if (dateOfBirth) {
        updateData.dateOfBirth = new Date(dateOfBirth);
      }

      // Update user via Prisma
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          role: true
        }
      });

      // Create or update address if provided
      if (street && area) {
        const existingAddress = await prisma.address.findFirst({
          where: {
            userId: userId,
            type: 'shipping'
          }
        });

        if (existingAddress) {
          await prisma.address.update({
            where: { id: existingAddress.id },
            data: {
              name: fullName,
              phone: phoneNumber || '',
              addressLine1: street,
              area,
              city: city || 'Dhaka',
              postalCode,
              isDefault: true
            }
          });
        } else {
          await prisma.address.create({
            data: {
              userId: userId,
              type: 'shipping',
              name: fullName,
              phone: phoneNumber || '',
              addressLine1: street,
              area,
              city: city || 'Dhaka',
              postalCode,
              isDefault: true
            }
          });
        }
      }
    } catch (prismaError) {
      console.error(prismaError); // Prisma fallback, logging the error
      // Prisma unavailable — fallback to file-based update
      const users = await readUsersFile();
      const userIndex = users.findIndex(u => (u.id === userId || u._id === userId));
      
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if phone is already taken by another user (file-based)
      if (phoneNumber && phoneNumber.trim() !== '') {
        const phoneExists = users.some((u, idx) => 
          idx !== userIndex && u.phone === phoneNumber
        );
        if (phoneExists) {
          return res.status(400).json({ error: 'Phone number already in use' });
        }
      }

      // Update user in the array
      const user = users[userIndex];
      user.firstName = firstName;
      user.lastName = lastName;
      if (gender) user.gender = gender;
      if (phoneNumber && phoneNumber.trim() !== '') user.phone = phoneNumber;
      if (dateOfBirth) user.dateOfBirth = dateOfBirth;
      if (street) user.street = street;
      if (area) user.area = area;
      if (city) user.city = city;
      if (postalCode) user.postalCode = postalCode;

      // Write back to file
      await writeUsersFile(users);

      updatedUser = {
        id: user.id || user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        role: user.role
      };
    }

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let user;

    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          role: true,
          addresses: {
            where: { isDefault: true }
          }
        }
      });
    } catch (prismaError) {
      console.error(prismaError); // Prisma fallback, logging the error
      // Prisma unavailable — fallback to file-based read
      const users = await readUsersFile();
      const foundUser = users.find(u => (u.id === userId || u._id === userId));
      
      if (foundUser) {
        user = {
          id: foundUser.id || foundUser._id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          phone: foundUser.phone,
          dateOfBirth: foundUser.dateOfBirth,
          gender: foundUser.gender,
          role: foundUser.role,
          street: foundUser.street,
          area: foundUser.area,
          city: foundUser.city,
          postalCode: foundUser.postalCode,
          addresses: foundUser.street && foundUser.area ? [{
            addressLine1: foundUser.street,
            area: foundUser.area,
            city: foundUser.city || 'Dhaka',
            postalCode: foundUser.postalCode,
            isDefault: true
          }] : []
        };
      }
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user orders
router.get('/me/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
