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
function sendVerificationEmail(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accessToken = yield oauth2Client.getAccessToken();
            const transporter = nodemailer_1.default.createTransport({
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
            const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
            const mailOptions = {
                from: `"Medication-Management" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Verify Your Email',
                text: `Please verify your email by clicking this link: ${verificationUrl}`,
                html: `<p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
            };
            const result = yield transporter.sendMail(mailOptions);
            console.log('Verification email sent successfully:', result);
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
            const accessToken = yield oauth2Client.getAccessToken();
            const transporter = nodemailer_1.default.createTransport({
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
            const verificationUrl = `http://localhost:5173/resetPassword/${email}`;
            const mailOptions = {
                from: `"Medication-Management" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Reset Your Passsword',
                text: `Please Reset Your Passsword by clicking this link: ${verificationUrl}`,
                html: `<p>Please Reset Your Passsword by clicking <a href="${verificationUrl}">this link</a>.</p>`,
            };
            const result = yield transporter.sendMail(mailOptions);
            console.log('Verification email sent successfully:', result);
        }
        catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email.');
        }
    });
}
