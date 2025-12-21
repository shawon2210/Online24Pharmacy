import prisma from '../db/prisma.js';

(async () => {
  try {
    console.log('Prisma client loaded');
    console.log('product presence:', typeof prisma.product);
    if (typeof prisma.$connect === 'function') {
      console.log('Attempting $connect()...');
      await prisma.$connect();
      console.log('Connected OK');
      await prisma.$disconnect();
      console.log('Disconnected OK');
    } else {
      console.log('$connect not available');
    }
  } catch (err) {
    console.error('Prisma error:', err);
    process.exit(1);
  }
})();
