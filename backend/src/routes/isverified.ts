import express from 'express'
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

export default router.post('/',async (req,res)=>{
    const {name , email} = req.body;
    const response = await prisma.user.findFirst({
        where : {
            name , email
        }
    })
    if(!response){
    res.status(400).json({
        message : "User is not verified yet"
    })
    }
    else res.status(200).json({verified : true})
})