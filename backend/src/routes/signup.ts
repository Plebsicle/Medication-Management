import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'
import {verifyUserDetails,verifyGoogleDetails} from '../middlewares/zodverification';
import { hashPassword } from '../_utilities/hash';
import verifyGoogleToken from '../_utilities/googleAuthService';
import { sendVerificationEmail } from '../_utilities/mailer';
import tokenGenerator from '../_utilities/tokenGenerator';

const router = express.Router();
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET as string;

router.post('/', async (req, res) => {
    try{
        const { googleId } = req.body;
    if(!googleId){
        const {name , email , role  , password} = req.body; 
        let zodCheck = await verifyUserDetails(name , email , role,password);
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
                      password : hashedPassword,
                      role,
                      verified: false, 
                    },
                  });
                await prisma.emailVerificationToken.create({
                    data: {
                      user_id : placeholderUser.id,
                      token : emailToken,
                      expiration,
                    },
                });
                sendVerificationEmail(email , emailToken);
                res.status(202).json({message : 'Email Verification Pending',isEmailVerified : false});
            }
            else{
                res.status(202).json({ message: "Email is already in use" , EmailinUse : true});
                return;
            }
        }
        else{
            res.status(202).json({message : "Entered Details are Not Valid",zodPass : false});
            return;
        }
    }
    else{
        const googleUser = await verifyGoogleToken(googleId);
            if(googleUser){
                const { email, name, sub: googleId } = googleUser;
                const {role} = req.body;
                if(role && email && name && await verifyGoogleDetails(name, email, role)){
                    const userPossible = await prisma.user.findFirst({where : {email}})
                    if(!userPossible){
                        const userCreationResponse = await prisma.user.create({
                            data : {name , email , role , verified : true}
                        })
                        const token = jwt.sign({name , email , role}, jwtSecret);
                        res.status(201).json(token);
                    }
                    else{
                        res.status(409).json({ message: "Email is already in use" ,EmailinUse : true});
                        return;
                    }
                }
                else
                {
                    res.status(400).json({message : "Google Credentials are Invalid",vaildDetails : false});
                    return;
                }
            }
            else{
                res.status(400).json({ message: "Invalid Google token" ,vaildDetails : false});
                return;
            } 
        }
    }
    catch(e){
        console.log("Error while signing up" , e);
        res.status(500).json({ message: "Internal server error" ,serverError : true});
    }
    
});

export default router;
