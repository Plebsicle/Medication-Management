import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; 
const router = express.Router();
const prisma = new PrismaClient();


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
        const { medicationFull } = req.body;

        if (!medicationFull) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        const { medication_id , name, type, dosage, start_date, end_date } = medicationFull;

        if (!name || !type || !dosage || !start_date || !end_date || !medication_id) {
            res.status(400).json({ error: "Incomplete medication details" });
            return;
        }

        const medication = await prisma.medication.findFirst({
            where: {
                medication_id
            },
        });

        if (!medication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        await prisma.medication.delete({
            where: { medication_id: medication.medication_id },
        });

        res.status(200).json({ message: "Medication deleted successfully" });
    } catch (error) {
        console.error("Error deleting medication", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;