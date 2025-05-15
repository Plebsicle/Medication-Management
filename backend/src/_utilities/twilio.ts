import twilio from 'twilio';

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Create Twilio client only if credentials are available
let twilioClient: twilio.Twilio | null = null;

try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
  } else {
    console.warn('Twilio credentials not found in environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Twilio client:', error);
}

/**
 * Send an SMS notification using Twilio
 * @param phoneNumber - Recipient's phone number (E.164 format recommended)
 * @param message - Message content
 * @returns Promise resolving to the message SID if successful
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<string | null> {
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
    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedNumber
    });
    
    console.log(`SMS sent to ${phoneNumber}, SID: ${result.sid}`);
    return result.sid;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return null;
  }
}

/**
 * Check if the Twilio client is properly initialized
 * @returns boolean indicating if Twilio is ready to use
 */
export function isTwilioConfigured(): boolean {
  return !!twilioClient && !!fromNumber;
} 