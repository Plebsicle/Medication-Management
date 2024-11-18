import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';


const router = express.Router();

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateVerificationToken = (email: string): string => {
  const payload = { email, id: uuidv4() };
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '10m' });
};

router.post('/send-verification-email', async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
        const token = generateVerificationToken(email);
        const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

        await saveVerificationTokenToDatabase(user.id, token);
    
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Verify Your Email',
          text: `Click the link to verify your email: ${verificationLink}`,
          html: `<p>Click <a href="${verificationLink}">here</a> to verify your email. This link expires in 10 minutes.</p>`,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ message: 'Error sending verification email' });
          }
          res.status(200).json({ message: 'Verification email sent' });
        });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email' });
  }
});

// Route to verify email from token
router.get('/verify-email', async (req: Request, res: Response) => {
  const token = req.query.token as string;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string; id: string };

    const isTokenValid = await checkTokenValidity(payload.email, token);
    if (!isTokenValid) {
      res.status(400).json({ message: 'Invalid or expired token' });
    }

    await markEmailAsVerified(payload.email);
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// Helper function to save verification token to the database
const saveVerificationTokenToDatabase = async (userId: bigint, token: string): Promise<void> => {
  const expiration = new Date(Date.now() + 10 * 60 * 1000); // Expiration set to 10 minutes

  await prisma.emailVerificationToken.upsert({
    where: { user_id: userId },
    update: { token, expiration },
    create: {
      token,
      expiration,
      user_id: userId, // Save user_id instead of email
    },
  });
};

// Helper function to check if the token is still valid
const checkTokenValidity = async (email: string, token: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { emailVerificationToken: true },
  });

  if (!user || !user.emailVerificationToken) {
    return false;
  }

  const { emailVerificationToken } = user;

  return emailVerificationToken.token === token && emailVerificationToken.expiration > new Date();
};

// Helper function to mark the user's email as verified
const markEmailAsVerified = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await prisma.user.update({
    where: { email },
    data: { verified: true },
  });

  await prisma.emailVerificationToken.delete({
    where: { user_id: user.id }, // Use user_id to delete the token
  });
};


export default router;
