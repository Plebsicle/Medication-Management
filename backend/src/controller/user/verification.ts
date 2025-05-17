import  { Request, Response } from 'express';
import prisma from '../../database';


export const postIsVerification = async (req : Request,res : Response)=>{
    const {email} = req.body;
    const response = await prisma.user.findFirst({
        where : {
            email
        }
    })
    if(!response){
        res.status(400).json({
            message : "User is not verified yet",
            isEmailVerified : false
        })
    }
    else {
        if(response.verified === true)
            res.status(200).json({verified : true});
        else 
            res.status(401).json({verified : false});
    }
}