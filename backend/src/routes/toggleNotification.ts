import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; 
const router = express.Router();
const prisma = new PrismaClient();

router.put('/', async (req, res) => {
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
        const { medication, notification_on } = req.body;
        if (!medication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }
        const { name, type, dosage, start_date, end_date } = medication;
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            res.status(400).json({ error: "Invalid date format for start_date or end_date" });
            return;
        }

        const medicationRecord = await prisma.medication.findFirst({
            where: {
                name,
                type,
                dosage,
                start_date: startDate,
                end_date: endDate,
            },
        });
        if(!medicationRecord){
            res.json({message : "Incorrect Information of Medication"});
            return;
        }

        if (typeof notification_on !== 'boolean') {
            res.status(400).json({ error: "Invalid notification status" });
            return;
        }
        const medication_id = medicationRecord.medication_id;
        await prisma.notification.updateMany({
            where: { medication_id },
            data: { notification_on },
        });

        res.status(200).json({ message: "Notification status updated successfully" });
    } catch (error) {
        console.error("Error updating notification status", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;