import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import webpush from 'web-push';
import schedule from 'node-schedule';

const prisma = new PrismaClient();

// Helper to validate and fix FCM endpoints
function validateAndFixEndpoint(endpoint: string): string {
  console.log('Raw endpoint:', endpoint);
  if (endpoint.includes('fcm.googleapis.com/fcm/send/')) {
    return endpoint.replace('fcm.googleapis.com/fcm/send/', 'fcm.googleapis.com/wp/');
  }
  if (endpoint.includes('fcm.googleapis.com/') && !endpoint.includes('/wp/')) {
    const parts = endpoint.split('fcm.googleapis.com/');
    const token = parts[1].split('/').pop();
    if (token) return `https://fcm.googleapis.com/wp/${token}`;
  }
  return endpoint;
}

// Main notification scheduler
async function sendNotifications() {
  const now = new Date();
  const currentTimeHHMM = now.toTimeString().slice(0, 5); // "HH:mm"
  console.log("Scheduler checking for notifications at:", currentTimeHHMM);

  try {
    const medicationTimes = await prisma.medication_times.findMany({
      where: {
        intake_time: currentTimeHHMM,
      },
      include: {
        medication: {
          include: {
            user: true,
            notification: true,
          },
        },
      },
    });

    console.log(`Found ${medicationTimes.length} medications due for notification`);

    for (const medTime of medicationTimes) {
      const { medication } = medTime;
      if (!medication || !medication.user) continue;

      // Check if notification is enabled
      const isNotifEnabled = medication.notification.some(n => n.notification_on);
      if (!isNotifEnabled) {
        console.log(`Skipping ${medication.name}: notifications off`);
        continue;
      }

      // Check medication is active (within start and end date)
      const nowDate = new Date();
      if (medication.start_date > nowDate || medication.end_date < nowDate) {
        console.log(`Skipping ${medication.name}: outside active date range`);
        continue;
      }

      const user = medication.user;
      const subscription = await prisma.subscription.findFirst({
        where: { user_id: user.id },
      });

      const message = `It's time to take your medication: ${medication.name}`;
      await logNotification(medication.medication_id, message);

      if (!subscription) {
        console.warn(`No subscription for user ID ${user.id}`);
        continue;
      }

      const fixedEndpoint = validateAndFixEndpoint(subscription.endpoint);
      if (fixedEndpoint !== subscription.endpoint) {
        await prisma.subscription.update({
          where: { subscription_id: subscription.subscription_id },
          data: { endpoint: fixedEndpoint },
        });
        console.log(`Fixed subscription endpoint for user ${user.id}`);
      }

      try {
        const pushSubscription = {
          endpoint: fixedEndpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key,
          },
        };

        const payload = JSON.stringify({
          title: 'Medication Reminder',
          body: message,
        });

        await webpush.sendNotification(pushSubscription, payload);
        console.log(`Notification sent to user ${user.id}`);
      } catch (err: any) {
        console.error(`Push failed for user ${user.id}:`, err);

        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.subscription.delete({
            where: { subscription_id: subscription.subscription_id },
          });
          console.log(`Deleted expired subscription for user ${user.id}`);
        }

        // Fallback API push
        try {
          await axios.post('http://localhost:8000/notify', {
            userId: user.id,
            message,
          });
          console.log(`Fallback notification sent for user ${user.id}`);
        } catch (fallbackErr) {
          console.error(`Fallback failed:`, fallbackErr);
        }
      }
    }
  } catch (err) {
    console.error("Scheduler error:", err);
  }
}

// Log the notification
async function logNotification(medication_id: number, message: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        message,
        medication_id,
        notification_on: true,
      },
    });

    await prisma.notification_logs.create({
      data: {
        notification_id: notification.notification_id,
        status: 'sent',
      },
    });

    console.log(`Logged notification for medication ID ${medication_id}`);
  } catch (err) {
    console.error(`Logging failed for medication ${medication_id}:`, err);
  }
}

// Start the scheduler
schedule.scheduleJob('* * * * *', sendNotifications);
console.log("Notification scheduler initialized");

// Run once at startup
sendNotifications().catch(console.error);

export default sendNotifications;
