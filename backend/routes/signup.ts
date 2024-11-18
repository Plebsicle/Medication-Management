import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'
import {verifyUserDetails,verifyGoogleDetails} from '../middlewares/zodverification';
import { hashPassword } from '../_utilities/hash';
import verifyGoogleToken from '../_utilities/googleAuthService';

const router = express.Router();
const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET as string;

router.post('/signup', async (req, res) => {
    try{
        const { googleId } = req.body;
    if(!googleId){
        const {name , email , role  , password} = req.body; 
        if(await verifyUserDetails(name , email , role,password)){
            const userPossible = await prisma.user.findUnique({
                where : {
                    email
                }
            })
            if(!userPossible){
                const hashedPassword = await hashPassword(password);
                const userCreationResponse = await prisma.user.create({
                    data : {name , email , role , password : hashedPassword}
                })
                const token = jwt.sign({name , email , role}, jwtSecret);
                res.json(token);
            }
            else{
                res.status(409).json({ message: "Email is already in use" });
                return;
            }
        }
        else{
            res.status(400).json("Entered Details are Not Valid");
            return
        }
    }
    else{
        const googleUser = await verifyGoogleToken(googleId);
            if(googleUser){
                const { email, name, sub: googleId } = googleUser;
                const {role} = req.body;
                if(role && email && name && await verifyGoogleDetails(name, email, role)){
                    const userPossible = await prisma.user.findUnique({where : {email}})
                    if(!userPossible){
                        const userCreationResponse = await prisma.user.create({
                            data : {name , email , role , verified : true}
                        })
                        const token = jwt.sign({name , email , role}, jwtSecret);
                        res.json(token);
                    }
                    else{
                        res.status(409).json({ message: "Email is already in use" });
                        return;
                    }
                }
                else
                {
                    res.status(400).json("Google Credentials are Invalid");
                    return;
                }
            }
            else{
                res.status(400).json({ message: "Invalid Google token" });
                return;
            } 
        }
    }
    catch(e){
        console.log("Error while signing up" , e);
        res.status(500).json({ message: "Internal server error" });
    }
    
});

export default router;
