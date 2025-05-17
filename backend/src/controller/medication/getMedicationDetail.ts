import prisma from "../../database";
import express from 'express';


export const getMedicationDetails = async (req : express.Request, res : express.Response) => {
    const email = req.userEmail;
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
}
