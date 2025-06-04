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
const twilio_1 = require("./twilio");
const mailer_1 = require("./mailer");
const node_schedule_1 = __importDefault(require("node-schedule"));
const database_1 = __importDefault(require("../database"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
// Main notification scheduler
function sendNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        const nowIST = (0, dayjs_1.default)().tz("Asia/Kolkata");
        const currentTimeHHMM = nowIST.format("HH:mm"); // IST-based "HH:mm"
        console.log("Scheduler checking for notifications at (IST):", currentTimeHHMM);
        try {
            const medicationTimes = yield database_1.default.medication_times.findMany({
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
                const isNotifEnabled = medication.notification.some((n) => n.notification_on);
                if (!isNotifEnabled) {
                    console.log(`Skipping ${medication.name}: notifications off`);
                    continue;
                }
                const nowDateIST = nowIST.toDate();
                if (medication.start_date > nowDateIST || medication.end_date < nowDateIST) {
                    console.log(`Skipping ${medication.name}: outside active date range`);
                    continue;
                }
                const user = medication.user;
                const messageText = `It's time to take your medication: ${medication.name}`;
                yield logNotification(medication.medication_id, messageText);
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
function logNotification(medication_id, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const notification = yield database_1.default.notification.create({
                data: {
                    message,
                    medication_id,
                    notification_on: true,
                },
            });
            yield database_1.default.notification_logs.create({
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
node_schedule_1.default.scheduleJob('* * * * *', sendNotifications);
console.log("Notification scheduler initialized");
sendNotifications().catch(console.error);
exports.default = sendNotifications;
