import cron from 'node-cron';
import prisma from '../db/prisma.js';
import { startJob } from './geocodeManager.js';

// Run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('[geocode cron] Starting geocode batch job...');
  try {
    const result = await startJob(prisma, { limit: 20, delayMs: 1000 });
    console.log('[geocode cron] Result:', result);
  } catch (err) {
    console.error('[geocode cron] Error running job:', err);
  }
});

console.log('Geocode cron job scheduled (every 30 minutes).');