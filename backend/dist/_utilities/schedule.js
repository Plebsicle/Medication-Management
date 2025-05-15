"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const twilio_1 = require("./twilio");
const mailer_1 = require("./mailer");
const node_schedule_1 = __importDefault(require("node-schedule"));
const prisma = new client_1.PrismaClient();
// Helper to validate and fix FCM endpoints
function validateAndFixEndpoint(endpoint) {
    console.log('Raw endpoint:', endpoint);
    if (endpoint.includes('fcm.googleapis.com/fcm/send/')) {
        return endpoint.replace('fcm.googleapis.com/fcm/send/', 'fcm.googleapis.com/wp/');
    }
    if (endpoint.includes('fcm.googleapis.com/') && !endpoint.includes('/wp/')) {
        const parts = endpoint.split('fcm.googleapis.com/');
        const token = parts[1].split('/').pop();
        if (token)
            return `https://fcm.googleapis.com/wp/${token}`;
    }
    return endpoint;
}
// Main notification scheduler
function sendNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const currentTimeHHMM = now.toTimeString().slice(0, 5); // "HH:mm"
        console.log("Scheduler checking for notifications at:", currentTimeHHMM);
        try {
            // Get all medication times for the current time
            const medicationTimes = yield prisma.medication_times.findMany({
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
                if (!medication || !medication.user)
                    continue;
                // Check if notification is enabled
                const isNotifEnabled = medication.notification.some((n) => n.notification_on);
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
                const messageText = `It's time to take your medication: ${medication.name}`;
                yield logNotification(medication.medication_id, messageText);
                // Send SMS notification via Twilio if user has SMS notifications enabled
                if (user.phone_number && user.sms_notifications) {
                    try {
                        yield (0, twilio_1.sendSMS)(user.phone_number, `Medication Reminder: It's time to take ${medication.name}. ${medication.dosage} ${medication.instructions ? '- ' + medication.instructions : ''}`);
                        console.log(`SMS notification sent to ${user.phone_number}`);
                    }
                    catch (smsError) {
                        console.error(`Failed to send SMS to ${user.phone_number}:`, smsError);
                    }
                }
                else if (user.phone_number) {
                    console.log(`Skipping SMS for user ${user.id}: SMS notifications disabled`);
                }
                // Send email notification if user has email notifications enabled
                if (user.email && user.email_notifications) {
                    try {
                        yield (0, mailer_1.sendEmail)(user.email, 'Medication Reminder', `<h2>Medication Reminder</h2>
            <p>Hello ${user.name},</p>
            <p>It's time to take your medication: <strong>${medication.name}</strong></p>
            <p>Dosage: ${medication.dosage}</p>
            ${medication.instructions ? `<p>Instructions: ${medication.instructions}</p>` : ''}
            <p>This is an automated reminder from your medication management system.</p>`);
                        console.log(`Email notification sent to ${user.email}`);
                    }
                    catch (emailError) {
                        console.error(`Failed to send email to ${user.email}:`, emailError);
                    }
                }
                else if (user.email) {
                    console.log(`Skipping email for user ${user.id}: Email notifications disabled`);
                }
            }
        }
        catch (err) {
            console.error("Scheduler error:", err);
        }
    });
}
// Log the notification
function logNotification(medication_id, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const notification = yield prisma.notification.create({
                data: {
                    message,
                    medication_id,
                    notification_on: true,
                },
            });
            yield prisma.notification_logs.create({
                data: {
                    notification_id: notification.notification_id,
                    status: 'sent',
                },
            });
            console.log(`Logged notification for medication ID ${medication_id}`);
        }
        catch (err) {
            console.error(`Logging failed for medication ${medication_id}:`, err);
        }
    });
}
// Start the scheduler
node_schedule_1.default.scheduleJob('* * * * *', sendNotifications);
console.log("Notification scheduler initialized");
// Run once at startup
sendNotifications().catch(console.error);
exports.default = sendNotifications;
