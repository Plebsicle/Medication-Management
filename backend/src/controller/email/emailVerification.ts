import  { Request, Response } from 'express';

import jwt from "jsonwebtoken";
import prisma from '../../database';

const jwtSecret = process.env.JWT_SECRET as string;

export const emailVerification = async (req : Request, res : Response) => {
  try {
    // console.log("Email Verification Endpoint Hit");

    const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
    console.log("Received Token:", token);
    if (!token) {
      res.status(400).json({ message: "Invalid token." });
    }

    const tokenRecord = await prisma.emailverificationtoken.findFirst({
      where: { token: token as string },
      include: { user: true },
    });

    console.log("Retrieved Token Record:", tokenRecord);

    if (!tokenRecord) {
      res.status(400).json({ message: "Invalid or expired token." });
      return;
    }
    if (tokenRecord.expiration < new Date()){
      res.status(400).json({ message: "Expired token." });
    }

    if (!tokenRecord.user) {
      res.status(400).json({ message: "User associated with the token does not exist." });
    }

    const user = tokenRecord.user;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { verified: true },
    });

    console.log("User Verified:", updatedUser);
    const jwtPayload = {
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };
    console.log(jwtPayload);
    const jwtToken = jwt.sign(jwtPayload, jwtSecret);
    console.log(jwtToken);
    res.status(200).json({
      message: "Email verified successfully.",
      jwt: jwtToken,
    });
  
    try {
      await prisma.emailverificationtoken.delete({ where: { token_id: tokenRecord.token_id, user_id: tokenRecord.user_id } });
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

    if (!res.headersSent) {
      res.status(500).json({ message: "An error occurred. Please try again." });
    }
  }
}