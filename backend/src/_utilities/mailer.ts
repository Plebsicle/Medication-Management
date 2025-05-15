import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const CLIENT_ID = process.env.MAILER_CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const REDIRECT_URL = process.env.REDIRECT_URL as string;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN as string;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * Get a configured nodemailer transporter
 * @returns Nodemailer transporter instance
 */
async function getTransporter() {
  const accessToken = await oauth2Client.getAccessToken();
  
  return nodemailer.createTransport({
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
}

/**
 * Send a generic email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param htmlContent - HTML content of the email
 * @param textContent - Plain text content (optional)
 * @returns Result from nodemailer
 */
export async function sendEmail(to: string, subject: string, htmlContent: string, textContent?: string) {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: `"Medication-Management" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML if no text version provided
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
    
    const htmlContent = `
      <h2>Verify Your Email</h2>
      <p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    
    return await sendEmail(
      email,
      'Verify Your Email',
      htmlContent,
      `Please verify your email by clicking this link: ${verificationUrl}`
    );
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}

export async function sendResetPassword(email: string) {
  try {
    const verificationUrl = `http://localhost:5173/resetPassword/${email}`;
    
    const htmlContent = `
      <h2>Reset Your Password</h2>
      <p>Please reset your password by clicking <a href="${verificationUrl}">this link</a>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    
    return await sendEmail(
      email,
      'Reset Your Password',
      htmlContent,
      `Please reset your password by clicking this link: ${verificationUrl}`
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email.');
  }
}