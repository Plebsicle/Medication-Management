import express from 'express';
import prisma from '../../database';

interface medicationTimes {
    medication_time_id : number,
    medication_id : number,
    intake_time : string
}

export const medicationChanges = async (req: express.Request, res: express.Response) => {
    const email = req.userEmail;

    const {
        name,
        medication_id,
        type,
        dosage,
        start_date,
        end_date,
        instructions,
        medication_times, // Now receiving medication_times objects array
        notification_on, // Direct boolean value
        frequency,
    } = req.body;

    try {
        const medication = await prisma.medication.findUnique({
            where: {
                medication_id
            },
        });

        if (!medication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        // Extract intake_time values from medication_times objects
        const intakeTimes = medication_times.map((timeObj : medicationTimes) => timeObj.intake_time);
        
        // Update the medication record
        const updatedMedication = await prisma.medication.update({
            where: {
                medication_id: medication.medication_id,
            },
            data: {
                name,
                frequency,
                type,
                dosage,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                instructions,
                medication_times: {
                    deleteMany: {}, // Delete all existing times
                    // Create new time entries
                    create: intakeTimes.map((time : string) => ({
                        intake_time: time,
                    })),
                },
                notification: {
                    updateMany: {
                        where: { medication_id: medication.medication_id },
                        data: {
                            notification_on: notification_on ?? false, // Use direct boolean value
                        },
                    },
                },
            },
            include: {
                medication_times: true,
                notification: true,
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