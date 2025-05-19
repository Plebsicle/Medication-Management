import express from 'express';
import prisma from '../../database';

export const toggleNotification = async (req : express.Request, res : express.Response) => {
   

    try {
        const { medication, notifications } = req.body;
        if (!medication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }
        let { name, type, dosage, startDate, endDate } = medication;
        startDate = new Date(startDate);
        endDate = new Date(endDate);

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

        if (typeof notifications !== 'boolean') {
            res.status(400).json({ error: "Invalid notification status" });
            return;
        }
        const medication_id = medicationRecord.medication_id;
        await prisma.notification.updateMany({
            where: { medication_id },
            data: { notification_on : notifications },
        });

        res.status(200).json({ message: "Notification status updated successfully" });
    } catch (error) {
        console.error("Error updating notification status", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}