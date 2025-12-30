import dotenv from 'dotenv';
dotenv.config();
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
import('./server/db/prisma.js').then(async (prisma) => {
  console.log('Prisma client loaded successfully');
  try {
    const count = await prisma.default.pickupLocation.count();
    console.log('Pickup locations count:', count);
  } catch (err) {
    console.error('Database query error:', err.message);
  }
}).catch(err => {
  console.error('Prisma client error:', err.message);
});
