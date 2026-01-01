import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import prescriptionRoutes from './routes/prescriptions.js';
import paymentRoutes from './routes/payments.js';
import wishlistRoutes from './routes/wishlist.js';
import reviewRoutes from './routes/reviews.js';
import couponRoutes from './routes/coupons.js';
import analyticsRoutes from './routes/analytics.js';
import reportsRoutes from './routes/reports.js';
import deliveryRoutes from './routes/delivery.js';
import usersRoutes from './routes/users.js';
import chatbotRoutes from './routes/chatbot.js';
import savedKitsRoutes from './routes/savedKits.js';
import pickupRoutes from './routes/pickup.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

// Load cron jobs (side-effect imports)
import './cron/reminders.js';
import './cron/geocode.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/kits', savedKitsRoutes);
app.use('/api', pickupRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
 

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };