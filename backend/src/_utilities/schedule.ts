import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function sendNotifications() {
  const now = new Date();
  console.log("Scheduler started");

  try {
    // Fetch medication_times and join medication with the user data
    const medicationTimes = await prisma.medication_times.findMany({
      where: {
        intake_time: {
          gte: new Date(now.setSeconds(0, 0)), // Start of the current minute
          lt: new Date(now.setSeconds(59, 999)), // End of the current minute
        },
      },
      include: {
        medication: {
          include: {
            user: true, // Include the user linked to the medication
          },
        },
      },
    });

    // Process each medication_time record
    for (const medTime of medicationTimes) {
      const { medication } = medTime;

      // Ensure the medication has an associated user
      const user = medication.user;  // This is now properly included
      if (!user) {
        console.warn(`No user found for medication: ${medication.name}`);
        continue;
      }

      // Prepare notification data
      const userId = user.id;
      const message = `It's time to take your medication: ${medication.name}`;

      // Send notification
      try {
        await axios.post('http://localhost:8000/notify', {
          userId,
          message,
        });

        console.log(`Notification sent for user: ${userId}, medication: ${medication.name}`);
      } catch (error) {
        console.error(`Failed to send notification for user: ${userId}`, error);
      }

      // Log the notification as sent
      const notification = await prisma.notification.create({
        data: {
          message,
          medication_id: medication.medication_id,
          notification_on: true,
        },
      });

      await prisma.notification_logs.create({
        data: {
          notification_id: notification.notification_id,
          status: 'sent',
        },
      });

      console.log(`Notification logged for medication: ${medication.name}`);
    }
  } catch (err) {
    console.error('Error sending notifications:', err);
  }
}

// Schedule the function to run every minute
import schedule from 'node-schedule';
schedule.scheduleJob('* * * * *', sendNotifications);

export default sendNotifications;
