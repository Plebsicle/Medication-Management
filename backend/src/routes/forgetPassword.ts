import express from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { sendResetPassword } from '../_utilities/mailer';
import { hashPassword } from '../_utilities/hash';
import { verifyEmailAlone,verifySigninManualDetails } from '../middlewares/zodverification';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/',async ( req,res)=>{
    try{
        const body = req.body;
        const receivedEmail = body.email;
        const zodCheck = await verifyEmailAlone(receivedEmail);
        if(!zodCheck){
            res.status(401).json({message : "Entered Email Does not Match Criteria",zodPass : false});
            return;
        }
        sendResetPassword(receivedEmail);
        res.status(201).json({message : "Email Sent",isEmailSent : true});
    }
    catch(error){
        console.log("Error in forget Password Backend",error);
        res.status(500).json("Internal Server Error ") ;
    }
});

router.put('/',async(req,res)=>{
    try{
        const body = req.body;
        const {email , password} = body;
        const zodCheck = await verifySigninManualDetails(email , password);
        if(!zodCheck){
            res.status(401).json({message : "Zod Failed",zodPass : false});
            return;
        }
        const user = await prisma.user.findFirst({
            where : {email}
        });
        if(!user){
            res.status(401).json({message : "User Has Signed In Yet",isUserPresent : false});
            return;
        }   
        const hashedPassword = await hashPassword(password);
        const response = await prisma.user.update({
            where : {
                id : user.id,
            },
            data : {
                password : hashedPassword
            }
        });
        res.status(200).json({message : "Password Changed successfully",passwordChanged:true});
    }
    catch(error){
        console.log(error);
        res.status(500).json("Internal Server Error");
    }
})

export default router;