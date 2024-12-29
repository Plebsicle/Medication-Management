import express from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
const router = express.Router();

router.get('/',async (req,res)=>{
     const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: "Authorization header is missing" });
            return;
        }
    
        let token = req.body.jwt || req.headers['authorization']?.split(' ')[1];
        if (token) {
            token = token.replace(/^"|"$/g, ''); 
        }
    
        let email;
    
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string); 
            email = decoded.email;
    
            if (!email) {
                res.status(400).json({ error: "Email not found in token" });
                return;
            }
        } catch (error) {
            res.status(401).json({ error: "Invalid or expired token" });
            return;
        }
        try{
            const response = await prisma.user.findFirst({
                where : {
                    email
                }
            })
            if(!response){res.status(400).json({message : "Invalid Email , Cannot find User"}); return;}
            const medicationData = await prisma.medication.findMany({
                where :{
                    user_id : response.id
                }
            })
            if(!medicationData){res.status(400).json({message : "No Medication Data Exists"});return;}
            
            res.status(200).json(medicationData);
        }   
        catch(e){
            console.log("Error in Fetching Medication History",e);
            res.status(500).json("Internal Server Error");
        }
})

export default router;