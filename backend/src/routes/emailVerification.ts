import { PrismaClient } from "@prisma/client";
import express from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();
const jwtSecret = process.env.JWT_SECRET as string;

router.post("/", async (req, res) => {
  try {
    console.log("Email Verification Endpoint Hit");

    const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
    console.log("Received Token:", token);
    if (!token) {
      res.status(400).json({ message: "Invalid token." });
    }

    // Find token record in the database
    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { token: token as string },
      include: { user: true },
    });

    console.log("Retrieved Token Record:", tokenRecord);

    // Check token validity
    if (!tokenRecord) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }
    if (tokenRecord.expiration < new Date()) {
      res.status(400).json({ message: "Expired token." });
    }

    // Ensure user exists in the token record
    if (!tokenRecord.user) {
      res.status(400).json({ message: "User associated with the token does not exist." });
    }

    const user = tokenRecord.user;

    // Mark the user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });

    console.log("User Verified:", updatedUser);

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
      jwt: jwtToken,
    });

    // Delete the token record
    try {
      await prisma.emailVerificationToken.delete({ where: { token_id: tokenRecord.token_id, user_id: tokenRecord.user_id } });
      console.log("Token deleted successfully.");
    } catch (deleteError: any) {
      if (deleteError.code === "P2025") {
        console.warn("Token already deleted or does not exist.");
      } else {
        throw deleteError;
      }
    }
  } catch (error) {
    console.error("Error during email verification:", error);

    // Ensure only one response is sent
    if (!res.headersSent) {
      res.status(500).json({ message: "An error occurred. Please try again." });
    }
  }
});

export default router;
