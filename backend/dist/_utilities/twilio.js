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
exports.sendSMS = sendSMS;
exports.isTwilioConfigured = isTwilioConfigured;
const twilio_1 = __importDefault(require("twilio"));
// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
// Create Twilio client only if credentials are available
let twilioClient = null;
try {
    if (accountSid && authToken) {
        twilioClient = (0, twilio_1.default)(accountSid, authToken);
        console.log('Twilio client initialized successfully');
    }
    else {
        console.warn('Twilio credentials not found in environment variables');
    }
}
catch (error) {
    console.error('Failed to initialize Twilio client:', error);
}
/**
 * Send an SMS notification using Twilio
 * @param phoneNumber - Recipient's phone number (E.164 format recommended)
 * @param message - Message content
 * @returns Promise resolving to the message SID if successful
 */
function sendSMS(phoneNumber, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!twilioClient || !fromNumber) {
                console.warn('Twilio client or from number not configured');
                return null;
            }
            // Ensure phone number is in E.164 format (starts with +)
            const formattedNumber = phoneNumber.startsWith('+')
                ? phoneNumber
                : `+${phoneNumber.replace(/\D/g, '')}`;
            // console.log(formattedNumber);
            const result = yield twilioClient.messages.create({
                body: message,
                from: fromNumber,
                to: formattedNumber
            });
            console.log(`SMS sent to ${phoneNumber}, SID: ${result.sid}`);
            return result.sid;
        }
        catch (error) {
            console.error('Error sending SMS:', error);
            return null;
        }
    });
}
/**
 * Check if the Twilio client is properly initialized
 * @returns boolean indicating if Twilio is ready to use
 */
function isTwilioConfigured() {
    return !!twilioClient && !!fromNumber;
}
