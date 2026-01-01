// ============================================
// Notification Cleanup Cron Job
// Deletes old notifications (older than 30 days)
// Runs daily at midnight
// ============================================

import cron from 'node-cron';
import { cleanupOldNotifications } from '../utils/notificationManager.js';

// Schedule cleanup job to run daily at midnight (00:00)
const cleanupJob = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('[CRON] Starting notification cleanup job...');
    const count = await cleanupOldNotifications();
    console.log(`[CRON] ✅ Notification cleanup completed. Deleted ${count} old notifications.`);
  } catch (error) {
    console.error('[CRON] Error in notification cleanup job:', error);
  }
});

// Alternative: Run cleanup every 6 hours (useful for high-traffic sites)
const frequentCleanupJob = cron.schedule('0 */6 * * *', async () => {
  try {
    console.log('[CRON] Running frequent notification cleanup...');
    const count = await cleanupOldNotifications();
    console.log(`[CRON] Cleanup completed. Deleted ${count} notifications.`);
  } catch (error) {
    console.error('[CRON] Error in frequent cleanup:', error);
  }
});

console.log('[CRON] ✅ Notification cleanup jobs scheduled');

export { cleanupJob, frequentCleanupJob };
