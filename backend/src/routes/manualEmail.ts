import express from 'express'
import { sendVerificationEmail } from '../_utilities/mailer';
import tokenGenerator from '../_utilities/tokenGenerator';
import { PrismaClient } from '@prisma/client';
import { verifyEmailAlone } from '../middlewares/zodverification';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/',async (req,res)=>{
    try{
    const {email} = req.body;
    const respon = await verifyEmailAlone(email);
    if(!respon){
        res.status(202).json({message : "Email is Not valid",zodPass : false})
        return;
    }
    if(!email){
        res.status(202).json({message : "No Email Sent" , isEmailPresent : false})
        return;
    }
    const emailToken = tokenGenerator();
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    console.log(emailToken);
    const placeholderUser = await prisma.user.findFirst({
        where : {
            email
        }
    });
    if(!placeholderUser){
        res.status(202).json({message : "User has not signed Up yet ", isSignedUp : false})
        return;
    }
    await prisma.emailVerificationToken.upsert({
        where: {
            user_id: placeholderUser.id,
        },
        update: {
            token: emailToken,
            expiration,
        },
        create: {
            user_id: placeholderUser.id,
            token: emailToken,
            expiration,
        },
    });
    sendVerificationEmail(email , emailToken);
    res.status(200).json({message : 'Email Verification Pending',isEmailVerified : false});
    }
    catch(e){
        console.log("Error in Manual Email Backend",e);
    }
    
})

export default router;