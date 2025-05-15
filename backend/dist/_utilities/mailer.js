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
exports.sendEmail = sendEmail;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendResetPassword = sendResetPassword;
const nodemailer_1 = __importDefault(require("nodemailer"));
const googleapis_1 = require("googleapis");
const CLIENT_ID = process.env.MAILER_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
/**
 * Get a configured nodemailer transporter
 * @returns Nodemailer transporter instance
 */
function getTransporter() {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield oauth2Client.getAccessToken();
        return nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
            logger: true,
            debug: true,
        });
    });
}
/**
 * Send a generic email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param htmlContent - HTML content of the email
 * @param textContent - Plain text content (optional)
 * @returns Result from nodemailer
 */
function sendEmail(to, subject, htmlContent, textContent) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = yield getTransporter();
            const mailOptions = {
                from: `"Medication-Management" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML if no text version provided
                html: htmlContent,
            };
            const result = yield transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return result;
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email.');
        }
    });
}
function sendVerificationEmail(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
            const htmlContent = `
      <h2>Verify Your Email</h2>
      <p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
            return yield sendEmail(email, 'Verify Your Email', htmlContent, `Please verify your email by clicking this link: ${verificationUrl}`);
        }
        catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email.');
        }
    });
}
function sendResetPassword(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const verificationUrl = `http://localhost:5173/resetPassword/${email}`;
            const htmlContent = `
      <h2>Reset Your Password</h2>
      <p>Please reset your password by clicking <a href="${verificationUrl}">this link</a>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
            return yield sendEmail(email, 'Reset Your Password', htmlContent, `Please reset your password by clicking this link: ${verificationUrl}`);
        }
        catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email.');
        }
    });
}
