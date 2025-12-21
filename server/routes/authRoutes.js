import express from 'express';
import { login, signup, refreshToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/roleAuth.js';
import { validateLogin, validateRegistration } from '../middleware/validation.js';

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/signup', validateRegistration, signup);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role
    }
  });
});

export default router;