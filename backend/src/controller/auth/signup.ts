import { Request,Response } from "express";
import prisma from "../../database";
import jwt from 'jsonwebtoken'
import {verifyUserDetails,verifyGoogleDetails} from '../../middlewares/zodverification';
import { hashPassword } from '../../_utilities/hash';
import verifyGoogleToken from '../../_utilities/googleAuthService';
import { sendVerificationEmail } from '../../_utilities/mailer';
import tokenGenerator from '../../_utilities/tokenGenerator';
const jwtSecret = process.env.JWT_SECRET as string;


export const signup = async (req : Request, res : Response) => {
    try{
        const { googleId } = req.body;
    if(!googleId){
        const {name, email, role, password, phone_number} = req.body; 
        let zodCheck = await verifyUserDetails(name, email, role, password, phone_number);
        if(zodCheck){
            const userPossible = await prisma.user.findFirst({
                where : {
                    email
                }
            });
            if(!userPossible){
                const emailToken = tokenGenerator();
                const expiration = new Date();
                expiration.setHours(expiration.getHours() + 1);
                const hashedPassword = await hashPassword(password);
                console.log(emailToken);
                const placeholderUser = await prisma.user.create({
                    data: {
                      email,
                      name,
                      password: hashedPassword,
                      role,
                      phone_number,
                      verified: false, 
                    },
                  });
                await prisma.emailverificationtoken.create({
                    data: {
                      user_id: placeholderUser.id,
                      token: emailToken,
                      expiration,
                    },
                });
                if(role === "doctor"){
                    await prisma.doctor.create({
                        data: {
                            user_id: placeholderUser.id,
                            speciality: "",
                            phone_number: "",
                        }
                    });
                }
                sendVerificationEmail(email, emailToken);
                res.status(202).json({message: 'Email Verification Pending', isEmailVerified: false});
            }
            else{
                res.status(202).json({ message: "Email is already in use", EmailinUse: true});
                return;
            }
        }
        else{
            res.status(202).json({message: "Entered Details are Not Valid", zodPass: false});
            return;
        }
    }
    else{
        const googleUser = await verifyGoogleToken(googleId);
            if(googleUser){
                const { email, name, sub: googleId } = googleUser;
                const {role, phone_number} = req.body;
                
                if (!phone_number) {
                    // If no phone number is provided, send a response indicating it's required
                    res.status(202).json({
                        message: "Phone number is required",
                        requirePhoneNumber: true,
                        googleData: { email, name, googleId, role }
                    });
                    return;
                }
                
                if(role && email && name && phone_number && 
                   await verifyGoogleDetails(name, email, role, phone_number)){
                    const userPossible = await prisma.user.findFirst({where: {email}})
                    if(!userPossible){
                        const userCreationResponse = await prisma.user.create({
                            data: {
                                name,
                                email,
                                role,
                                phone_number,
                                verified: true,
                                google_id: googleId
                            }
                        });
                        const token = jwt.sign({userId: userCreationResponse.id, name, email, role}, jwtSecret);
                        res.status(201).json({jwt: token, role : userCreationResponse.role});
                    }
                    else{
                        res.status(409).json({ message: "Email is already in use", EmailinUse: true});
                        return;
                    }
                }
                else
                {
                    res.status(400).json({message: "Google Credentials are Invalid", vaildDetails: false});
                    return;
                }
            }
            else{
                res.status(400).json({ message: "Invalid Google token", vaildDetails: false});
                return;
            } 
        }
    }
    catch(e){
        console.log("Error while signing up", e);
        res.status(500).json({ message: "Internal server error", serverError: true});
    }
}

export const googlePhoneSignup = async (req : Request, res : Response) => {
    try {
        const { email, name, googleId, role, phone_number } = req.body;
        
        if (!phone_number) {
             res.status(400).json({ message: "Phone number is required" });
             return
        }
        
        if (!email || !name || !googleId || !role) {
             res.status(400).json({ message: "Missing required fields" });
             return
        }
        
        if (await verifyGoogleDetails(name, email, role, phone_number)) {
            const userExists = await prisma.user.findFirst({ where: { email } });
            
            if (userExists) {
                // Update existing user
                await prisma.user.update({
                    where: { id: userExists.id },
                    data: { phone_number }
                });
                
                const token = jwt.sign({userId: userExists.id, name, email, role}, jwtSecret);
                res.status(200).json({ jwt: token ,role : userExists.role});
            } else {
                // Create new user
                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        role,
                        phone_number,
                        verified: true,
                        google_id: googleId
                    }
                });
                
                const token = jwt.sign({userId: user.id, name, email, role}, jwtSecret);
                res.status(201).json({ jwt: token ,role : user.role});
            }
        } else {
            res.status(400).json({ message: "Invalid phone number format" });
        }
    } catch (error) {
        console.error("Error processing Google phone number:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}