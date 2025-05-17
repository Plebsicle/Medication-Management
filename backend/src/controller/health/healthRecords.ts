import  express  from 'express';
import prisma from '../../database';

export const getHealthRecords = async (req : express.Request,res : express.Response)=>{
   const email = req.userEmail;
    try{
        const user = await prisma.user.findFirst({
            where : {
                email
            }
        });
        if(!user){
            res.status(404).json({message : "User Does not Exist , SignUp First",isUser : false});
            return;
        }
        const data = await prisma.health_records.findMany({
            where : {
                user_id : user.id
            }
        });
        if(!data){
            res.status(404).json({message : "Data Not Found",isData : false});
            return;
        }
        res.status(200).json(data);
    }
    catch(error){
        console.log("Internal Server Erorr in fetching data Backend" , error);
        res.status(500).json({message : "Internal Server Error"});
    }
}

export const postHealthRecords = async (req : express.Request, res : express.Response) => {
    const email = req.userEmail;

    try {
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            res.status(404).json({ message: "User does not exist. Please sign up first.", isUser: false });
            return;
        }

        const { record_date, blood_pressure, heart_rate, weight, temperature, notes } = req.body;

        if (!record_date) {
            res.status(400).json({ error: "Record date is required." });
            return;
        }

        const newHealthRecord = await prisma.health_records.create({
            data: {
                user_id: user.id,
                record_date: new Date(record_date),
                blood_pressure: blood_pressure || null,
                heart_rate: heart_rate ? parseInt(heart_rate, 10) : null,
                weight: weight ? parseFloat(weight) : null,
                temperature: temperature ? parseFloat(temperature) : null,
                notes: notes || null,
            },
        });

        res.status(201).json({ message: "Health record added successfully.", data: newHealthRecord });
    } catch (error) {
        console.error("Internal Server Error in Backend", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}