import {Request,Response} from 'express'
import prisma from '../../database';

export const getMedicationHistory = async (req : Request,res  : Response)=>{
        const email = req.userEmail;
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
            
            // Format the dates in a human-readable format
            const formattedMedicationData = medicationData.map(medication => ({
                ...medication,
                start_date: new Date(medication.start_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                end_date: new Date(medication.end_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            }));
            
            res.status(200).json(formattedMedicationData);
        }   
        catch(e){
            console.log("Error in Fetching Medication History",e);
            res.status(500).json("Internal Server Error");
        }
}