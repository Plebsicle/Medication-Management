import { Request,Response } from "express";
import jwt from "jsonwebtoken";
import verifyGoogleToken from "../../_utilities/googleAuthService";
import bcrypt from "bcrypt";
import {verifySigninManualDetails} from '../../middlewares/zodverification';
import prisma from '../../database';


const jwtSecret = process.env.JWT_SECRET as string;

export const signin = async (req : Request, res : Response) => {
  try {
    const { googleId, email, password } = req.body;
    if (googleId) {
      const payload = await verifyGoogleToken(googleId);
      if (!payload || !payload.email) {
        res.status(202).json({ message: "Invalid Google Token" ,googleTokenCorrect : false});
        return;
      }
      const email = payload.email;
      console.log(email);
      const name =payload.name;
      let user = await prisma.user.findFirst({ where: { email } });
      if (user) {
        const jwtToken = jwt.sign({ userId : user.id , name : user.name , email: user.email ,role : user.role}, jwtSecret);
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
        const jwtToken = jwt.sign({ userId : user.id , name : user.name , email: user.email ,role : user.role }, jwtSecret);
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
}