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
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
function sendNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        console.log("Scheduler started");
        try {
            // Fetch medication_times and join medication with the user data
            const medicationTimes = yield prisma.medication_times.findMany({
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
                const user = medication.user; // This is now properly included
                if (!user) {
                    console.warn(`No user found for medication: ${medication.name}`);
                    continue;
                }
                // Prepare notification data
                const userId = user.id;
                const message = `It's time to take your medication: ${medication.name}`;
                // Send notification
                try {
                    yield axios_1.default.post('http://localhost:8000/notify', {
                        userId,
                        message,
                    });
                    console.log(`Notification sent for user: ${userId}, medication: ${medication.name}`);
                }
                catch (error) {
                    console.error(`Failed to send notification for user: ${userId}`, error);
                }
                // Log the notification as sent
                const notification = yield prisma.notification.create({
                    data: {
                        message,
                        medication_id: medication.medication_id,
                        notification_on: true,
                    },
                });
                yield prisma.notification_logs.create({
                    data: {
                        notification_id: notification.notification_id,
                        status: 'sent',
                    },
                });
                console.log(`Notification logged for medication: ${medication.name}`);
            }
        }
        catch (err) {
            console.error('Error sending notifications:', err);
        }
    });
}
// Schedule the function to run every minute
const node_schedule_1 = __importDefault(require("node-schedule"));
node_schedule_1.default.scheduleJob('* * * * *', sendNotifications);
exports.default = sendNotifications;
