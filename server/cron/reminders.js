import cron from 'node-cron';
import prisma from '../db/client.js';
import { sendPrescriptionExpiryReminder } from '../utils/notifications.js';

// Schedule a job to run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running prescription expiry check...');

  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiringPrescriptions = await prisma.prescription.findMany({
    where: {
      expiresAt: {
        gte: today,
        lt: threeDaysFromNow,
      },
      isReorderable: true,
      status: {
        in: ['ACTIVE', 'APPROVED'],
      }
    },
    include: {
      user: true,
    },
  });

  console.log(`Found ${expiringPrescriptions.length} prescriptions expiring soon.`);

  for (const prescription of expiringPrescriptions) {
    await sendPrescriptionExpiryReminder(prescription.user, prescription);
  }
});

console.log('Prescription expiry reminder cron job scheduled.');
