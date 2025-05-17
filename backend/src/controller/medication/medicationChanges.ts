import  express  from 'express';
import jwt from 'jsonwebtoken'
import prisma from '../../database';

export const medicationChanges = async (req: express.Request, res: express.Response) => {
    // console.log(req.body);
    const email = req.userEmail;

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
                        intake_time: time, 
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
}
