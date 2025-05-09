import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Validate FCM endpoint format
function validateAndFixEndpoint(endpoint: string): string {
  // Log the endpoint for debugging
  console.log('Raw endpoint:', endpoint);
  
  // Check Google FCM endpoints
  if (endpoint.includes('fcm.googleapis.com/fcm/send/')) {
    console.log('Fixing FCM endpoint format (send → wp)');
    return endpoint.replace('fcm.googleapis.com/fcm/send/', 'fcm.googleapis.com/wp/');
  }
  
  // Handle various FCM endpoint formats
  if (endpoint.includes('fcm.googleapis.com/') && !endpoint.includes('/wp/')) {
    const parts = endpoint.split('fcm.googleapis.com/');
    if (parts.length > 1) {
      const token = parts[1].split('/').pop();
      if (token) {
        console.log('Reconstructing FCM endpoint with proper format');
        return `https://fcm.googleapis.com/wp/${token}`;
      }
    }
  }
  
  return endpoint;
}

async function sendNotifications() {
  const now = new Date();
  console.log("Scheduler checking for notifications at:", now.toISOString());

  try {
    // Fetch medication_times for the current minute
    const currentMinute = new Date();
    const startOfMinute = new Date(currentMinute.setSeconds(0, 0));
    const endOfMinute = new Date(currentMinute.setSeconds(59, 999));

    console.log(`Checking medications between ${startOfMinute.toISOString()} and ${endOfMinute.toISOString()}`);

    const medicationTimes = await prisma.medication_times.findMany({
      where: {
        intake_time: {
          gte: startOfMinute,
          lt: endOfMinute,
        },
      },
      include: {
        medication: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${medicationTimes.length} medications due for notification`);

    // Process each medication_time record
    for (const medTime of medicationTimes) {
      const { medication } = medTime;
      
      // First check if the medication is valid
      if (!medication || typeof medication !== 'object') {
        console.warn('Invalid medication record');
        continue;
      }
      
      // Check notification status if it exists
      if ('notification_on' in medication && medication.notification_on === false) {
        console.log(`Skipping notification for ${medication.name} - notifications disabled`);
        continue;
      }

      // Skip if medication is not active (outside date range)
      if (medication.start_date > now || medication.end_date < now) {
        console.log(`Skipping notification for ${medication.name} - outside active date range`);
        continue;
      }

      // Ensure the medication has an associated user
      const user = medication.user;
      if (!user) {
        console.warn(`No user found for medication: ${medication.name}`);
        continue;
      }

      // Get subscription for this user
      const subscription = await prisma.subscription.findFirst({
        where: { user_id: user.id },
      });

      if (!subscription) {
        console.warn(`No subscription found for user ID: ${user.id}`);
        // Log the notification anyway even if we can't send it
        await logNotification(medication.medication_id, `It's time to take your medication: ${medication.name}`);
        continue;
      }

      // Fix the endpoint format if needed
      const fixedEndpoint = validateAndFixEndpoint(subscription.endpoint);
      if (fixedEndpoint !== subscription.endpoint) {
        // Update the subscription with the fixed endpoint
        await prisma.subscription.update({
          where: { subscription_id: subscription.subscription_id },
          data: { endpoint: fixedEndpoint }
        });
        console.log(`Updated endpoint format for subscription: ${subscription.subscription_id}`);
      }

      // Prepare notification message
      const message = `It's time to take your medication: ${medication.name}`;
      console.log(`Preparing to send notification to user ${user.id}: ${message}`);

      // Log the notification in the database
      await logNotification(medication.medication_id, message);

      try {
        // Create a properly formatted subscription object
        const pushSubscription = {
          endpoint: fixedEndpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key,
          },
        };

        // Send direct web push notification
        const payload = JSON.stringify({
          title: 'Medication Reminder',
          body: message,
        });

        await webpush.sendNotification(pushSubscription, payload);
        console.log(`Web Push notification sent directly to user: ${user.id}`);
      } catch (error: any) {
        console.error(`Failed to send push notification:`, error);
        
        // If the subscription is invalid or expired, remove it
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log(`Removing invalid subscription for user ${user.id}`);
          await prisma.subscription.delete({
            where: { subscription_id: subscription.subscription_id }
          });
        }
        
        // Fallback to the /notify endpoint if direct push fails
        try {
          await axios.post('http://localhost:8000/notify', {
            userId: user.id,
            message,
          });
          console.log(`Notification sent via API for user: ${user.id}`);
        } catch (apiError) {
          console.error(`Failed to send notification via API:`, apiError);
        }
      }
    }
  } catch (err) {
    console.error('Error in notification scheduler:', err);
  }
}

// Helper function to log notifications to the database
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

    console.log(`Notification logged for medication ID: ${medication_id}`);
    return notification;
  } catch (error) {
    console.error('Error logging notification:', error);
    return null;
  }
}

// Schedule the function to run every minute
import schedule from 'node-schedule';
const job = schedule.scheduleJob('* * * * *', sendNotifications);
console.log('Notification scheduler initialized');

// Run immediately on startup
sendNotifications().catch(err => {
  console.error('Error running initial notification check:', err);
});

export default sendNotifications;
