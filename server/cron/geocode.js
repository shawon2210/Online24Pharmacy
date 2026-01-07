import cron from 'node-cron';
import prisma from '../db/prisma.js';
import { startJob } from './geocodeManager.js';

// Run geocode job every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    const result = await startJob(prisma, { limit: 20, delayMs: 1000 });
    
    if (result.started && result.result?.result) {
      const { updated, failed, total } = result.result.result;
      if (total === 0) {
        console.log('[geocode cron] ✓ All locations geocoded');
      } else if (updated > 0) {
        console.log(`[geocode cron] ✓ Geocoded ${updated}/${total} locations`);
      } else if (failed > 0) {
        console.log(`[geocode cron] ⚠ Failed ${failed}/${total} locations`);
      }
    } else if (!result.started) {
      console.log(`[geocode cron] ⏭ Skipped: ${result.reason}`);
    }
  } catch (err) {
    console.error('[geocode cron] Error:', err.message);
  }
});

console.log('Geocode cron job scheduled (every 30 minutes)');
