import express from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

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
});

router.post('/', async (req, res) => {
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
});



export default router