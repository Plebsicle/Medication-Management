import { PrismaClient } from "@prisma/client";
import express from 'express';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET as string;

router.get('/', async (req, res) => {
  try {
    console.log("Email Verification Endpoint Hit");

    // Extract and validate the token
    const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
    console.log(token);
    if (!token) {
      res.status(400).json({ message: "Invalid token." });
      return;
    }

    // Find token record in the database
    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { token: token as string }, 
      include: { user: true },
    });

    console.log("Retrieved Token Record:", tokenRecord);

    // Check token validity
    if (!tokenRecord || tokenRecord.expiration < new Date()) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    // Mark the user as verified
    if (!tokenRecord || !tokenRecord.user) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }

    const user = tokenRecord.user;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });

    // Generate a JWT for the user
    const jwtPayload = {
      id: updatedUser.id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const jwtToken = jwt.sign(jwtPayload, jwtSecret);

    // Respond with success and the JWT
    res.status(200).json({
      message: "Email verified successfully.",
      token: jwtToken,
    });

    await prisma.emailVerificationToken.delete({ where: { token_id: tokenRecord.token_id, user_id: tokenRecord.user_id } });

  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

export default router;
