import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const CLIENT_ID = process.env.MAILER_CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URL = process.env.REDIRECT_URL as string;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN as string;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER as string,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token as string,
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

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}
