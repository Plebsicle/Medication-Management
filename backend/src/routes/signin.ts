import express from "express";
import { PrismaClient } from "@prisma/client";
import verifyGoogleToken from "../_utilities/googleAuthService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {verifySigninManualDetails} from '../middlewares/zodverification';
import isverified from "./isverified";

const router = express.Router();
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET as string;

router.post("/", async (req, res) => {
  try {
    const { googleId, email, password } = req.body;
    if (googleId) {
      const payload = await verifyGoogleToken(googleId);
      if (!payload || !payload.email) {
        res.status(202).json({ message: "Invalid Google Token" ,googleTokenCorrect : false});
        return;
      }
      const email = payload.email;
      let user = await prisma.user.findFirst({ where: { email } });

      if (user) {
        const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret);
         res.status(200).json({ jwt: jwtToken });
         return;
      } else {
         res.status(202).json({ message: "User not found. Please sign up first." ,userFound : false});
         return;
      }
    }
    if(email && password){
      let zodCheck = await verifySigninManualDetails(email,password);
      if(!zodCheck){
        res.status(202).json({message : "Invalid Password or Email",zodPass : false});
        return;
      }
      let user = await prisma.user.findFirst({ where: { email } });
      if(!user){
         res.status(202).json({ message: "User not found. Please sign up first." ,userFound : false});
         return;
      }
      if (!user.password){
         res.status(202).json({
          message: "Password not set. Please update your profile to set a password.",
          isPasswordSet : false
        });
        return;
      }
      const isVerified = user.verified;
      if(isVerified === false) {
        res.status(202).json({ message: "Please Verify You Email" ,isEmailVerified : false});
        return;
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch){
            res.status(202).json({ message: "Incorrect password. Please try again." ,isPasswordCorrect : false});
            return;
        }
        const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret);
        res.status(200).json({ jwt: jwtToken });
        return;
    }
    res.status(202).json({ message: "Email and password are required for manual sign-in." ,fullDetails : false});
    return;
  } catch(error){
    console.error("Sign-In Error:", error);
     res.status(500).json({ message: "Internal server error",serverError : true });
     return;
  }
});

export default router;
