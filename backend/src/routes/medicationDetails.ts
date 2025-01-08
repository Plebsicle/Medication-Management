import express from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
const router = express.Router();

router.get('/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = req.headers['authorization']?.split(' ')[1];
    if(!token){res.status(400).json({message : "No Token Found",isTokenPresent : true});return;}
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
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User does not exist. Please sign up first." });
            return;
        }

        const medication_id : string = req.params.id;
        const med_id = parseInt(medication_id);
        const medication = await prisma.medication.findFirst({
            where: { medication_id : med_id, user_id: user.id },
            include: { medication_times: true, notification: true },
        });

        if (!medication) {
            res.status(404).json({ message: "Medication not found" });
            return;
        }

        res.status(200).json(medication);
    } catch (error) {
        console.error("Internal Server Error", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;