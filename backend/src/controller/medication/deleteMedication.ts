import express from 'express';
import prisma from '../../database';

export const deleteMedication =  async (req : express.Request, res : express.Response) => {
    try {
        const { medicationFull } = req.body;

        if (!medicationFull) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }

        const { medication_id } = medicationFull;

        if ( !medication_id) {
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
}