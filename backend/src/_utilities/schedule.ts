import { sendSMS } from './twilio';
import { sendEmail } from './mailer';
import schedule from 'node-schedule';
import prisma from '../database';


// Main notification scheduler
async function sendNotifications() {
  const now = new Date();
  const currentTimeHHMM = now.toTimeString().slice(0, 5); // "HH:mm"
  console.log("Scheduler checking for notifications at:", currentTimeHHMM);

  try {
    // Get all medication times for the current time
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
      const { medication } = medTime as any;
      if (!medication || !medication.user) continue;

      // Check if notification is enabled
      const isNotifEnabled = medication.notification.some((n: any) => n.notification_on);
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

      const user = medication.user as any;
      const messageText = `It's time to take your medication: ${medication.name}`;
      await logNotification(medication.medication_id, messageText);

      // Send SMS notification via Twilio if user has SMS notifications enabled
      if (user.phone_number && user.sms_notifications) {
        try {
          await sendSMS(
            user.phone_number, 
            `Medication Reminder: It's time to take ${medication.name}. ${medication.dosage} ${medication.instructions ? '- ' + medication.instructions : ''}`
          );
          console.log(`SMS notification sent to ${user.phone_number}`);
        } catch (smsError) {
          console.error(`Failed to send SMS to ${user.phone_number}:`, smsError);
        }
      } else if (user.phone_number) {
        console.log(`Skipping SMS for user ${user.id}: SMS notifications disabled`);
      }

      // Send email notification if user has email notifications enabled
      if (user.email && user.email_notifications) {
        try {
          await sendEmail(
            user.email,
            'Medication Reminder',
            `<h2>Medication Reminder</h2>
            <p>Hello ${user.name},</p>
            <p>It's time to take your medication: <strong>${medication.name}</strong></p>
            <p>Dosage: ${medication.dosage}</p>
            ${medication.instructions ? `<p>Instructions: ${medication.instructions}</p>` : ''}
            <p>This is an automated reminder from your medication management system.</p>`
          );
          console.log(`Email notification sent to ${user.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      } else if (user.email) {
        console.log(`Skipping email for user ${user.id}: Email notifications disabled`);
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
