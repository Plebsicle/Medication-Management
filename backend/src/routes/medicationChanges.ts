import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'

const router = express.Router();
const prisma = new PrismaClient();

router.put("/:id", async (req: Request, res: Response) => {
    console.log(req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "No Token Found", isTokenPresent: true });
        return;
    }
    if (token) {
        token = token.replace(/^"|"$/g, "");
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

    const {medication_id,type,dosage,start_date,end_date,instructions,intake_times,notification,
frequency,
    } = req.body;

    try {
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User does not exist. Please sign up first." });
            return;
        }

        const medication = await prisma.medication.findUnique({
            where: {
                medication_id
            },
        });

        if (!medication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        
        const intakeTimesArray = Array.isArray(intake_times)
            ? intake_times
            : [intake_times]; 

        
        const updatedMedication = await prisma.medication.update({
            where: {
                medication_id: medication.medication_id,
            },
            data: {
                type,
                dosage,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                instructions,
                medication_times: {
                    deleteMany: {},
                    create: intakeTimesArray.map((time: string) => ({
                        intake_time: new Date(`1970-01-01T${time}`), 
                    })),
                },
                notification: {
                    updateMany: {
                        where: { medication_id: medication.medication_id },
                        data: {
                            notification_on: notification[0]?.notification_on || false, 
                        },
                    },
                },
            },
            include: {
                medication_times: true,
            },
        });

        res.status(200).json({
            message: "Medication updated successfully",
            medication: updatedMedication,
        });
    } catch (error) {
        console.error("Error updating medication details:", error);
        res.status(500).json({ error: "Failed to update medication details" });
    }
});


export default router;
