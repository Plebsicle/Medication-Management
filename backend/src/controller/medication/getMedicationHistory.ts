import express from 'express';
import prisma from '../../database';

export const getMedicationHistory = async (req : express.Request,res  : express.Response)=>{
        const email = req.userEmail;
        try{
            const response = await prisma.user.findFirst({
                where : {
                    email
                }
            });
             const currentDate = new Date();
            if(!response){res.status(400).json({message : "Invalid Email , Cannot find User"}); return;}
            const medicationData = await prisma.medication.findMany({
                where :{
                    user_id : response.id,
                    end_date : {lte : currentDate}
                },
                include : {
                    medication_times : true,
                    notification : true
                }
            });
            
            if(!medicationData){res.status(400).json({message : "No Medication Data Exists"});return;}

            res.status(200).json(medicationData);
        }   
        catch(e){
            console.log("Error in Fetching Medication History",e);
            res.status(500).json("Internal Server Error");
        }
}