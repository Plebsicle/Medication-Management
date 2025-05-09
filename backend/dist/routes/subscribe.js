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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const web_push_1 = __importDefault(require("web-push"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// Web Push VAPID keys (store these in environment variables)
const PUBLIC_VAPID_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY;
web_push_1.default.setVapidDetails('mailto:your-email@example.com', PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);
// Subscribe route
router.post('/subscribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }
    let token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(400).json({ message: "No Token Found", isTokenPresent: true });
        return;
    }
    if (token) {
        token = token.replace(/^"|"$/g, '');
    }
    let email;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        email = decoded.email;
        if (!email) {
            res.status(400).json({ error: "Email not found in token" });
            return;
        }
    }
    catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
    try {
        const { subscription } = req.body;
        const response = yield prisma.user.findFirst({
            where: { email }
        });
        if (!response) {
            res.status(401).json({ message: "User Does Not Exist", userExists: false });
            return;
        }
        const userId = response.id;
        // Check if a subscription already exists for this user and endpoint
        const existingSubscription = yield prisma.subscription.findFirst({
            where: {
                user_id: userId,
                endpoint: subscription.endpoint,
            },
        });
        if (existingSubscription) {
            // Update the existing subscription
            yield prisma.subscription.update({
                where: { subscription_id: existingSubscription.subscription_id },
                data: {
                    expiration_time: subscription.expirationTime
                        ? new Date(subscription.expirationTime)
                        : null,
                    p256dh_key: subscription.keys.p256dh,
                    auth_key: subscription.keys.auth,
                },
            });
        }
        else {
            // Create a new subscription
            yield prisma.subscription.create({
                data: {
                    user_id: userId,
                    endpoint: subscription.endpoint,
                    expiration_time: subscription.expirationTime
                        ? new Date(subscription.expirationTime)
                        : null,
                    p256dh_key: subscription.keys.p256dh,
                    auth_key: subscription.keys.auth,
                },
            });
        }
        res.status(201).json({ message: 'Subscribed successfully!' });
    }
    catch (error) {
        console.error('Subscription Error:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
}));
router.post('/notify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, message } = req.body;
        const subscription = yield prisma.subscription.findFirst({
            where: { user_id: userId },
        });
        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        // Send notification
        const payload = JSON.stringify({ title: 'Medication Reminder', body: message });
        yield web_push_1.default.sendNotification({
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh_key,
                auth: subscription.auth_key,
            },
        }, payload);
        res.status(200).json({ message: 'Notification sent!' });
    }
    catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
}));
exports.default = router;
