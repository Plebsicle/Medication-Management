import express from 'express';
import prisma from '../../database';

enum medication_type {
    pills = "pills",
    syrup = "syrup",
    injection = "injection",
}

type FormDataType = {
    medication_id : number;
    name: string;
    type: medication_type;
    dosage: string;
    startDate: string;
    endDate: string;
    frequency: number;
    intakeTimes: string[];
    instructions: string;
    notifications : boolean;
};

export const postMedication = async (req : express.Request, res : express.Response) => {

    const email = req.userEmail;
    try {
        const { formData } = req.body;
        // console.log(req.body);
        console.log(formData);
        if (!formData) {
            res.status(202).json({ message: "Form data is required", isInfopresent: false });
            return;
        }

        if (!Object.values(medication_type).includes(formData.type)) {
            res.status(400).json({ error: "Invalid medication type" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const medication = await prisma.medication.create({
            data: {
                user_id: user.id,
                name: formData.name,
                type: formData.type,
                dosage: formData.dosage,
                frequency: parseInt(formData.frequency),
                start_date: new Date(formData.startDate),
                end_date: new Date(formData.endDate),
                instructions: formData.instructions || "",
            },
        });

        const medicationTimesData = formData.intakeTimes.map((time: string) => ({
            medication_id: medication.medication_id,
            intake_time: time,
        }));

        await prisma.medication_times.createMany({
            data: medicationTimesData,
        });

        const notification = await prisma.notification.create({
            data: {
                medication_id: medication.medication_id,
                notification_on: formData.notification_on,
                message: `Time to take your medication: ${medication.name}`,
            },
        });

        res.status(200).json({
            message: "Medication added successfully",
        });

    } catch (error) {
        console.error("Error In Add Medication Backend", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getMedication = async (req : express.Request,res : express.Response)=>{
    const email = req.userEmail;
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        res.status(404).json({ error: "User not found" ,isUser : false});
        return;
    }
    const currentDate = new Date();

    const medications = await prisma.medication.findMany({
        where: {
            user_id: user.id,
            end_date: { gte: currentDate }, 
        },
        include: {
            medication_times: true, 
            notification: true,   
        },
    });
    if(!medications){
        res.status(200).json({message : "No Active Medications",isMedication : false});
        return;
    }
    const formattedMedications: FormDataType[] = medications.map((medication) => ({
        medication_id : medication.medication_id,
        name: medication.name,
        type: medication.type as medication_type,
        dosage: medication.dosage,
        startDate: medication.start_date.toISOString().split('T')[0],
        endDate: medication.end_date.toISOString().split('T')[0],
        frequency: medication.medication_times.length, 
        intakeTimes: medication.medication_times.map((time) => time.intake_time),
        instructions: medication.instructions || "",
        notifications: medication.notification.some((notif) => notif.notification_on),
    }));

    res.status(200).json({ medications: formattedMedications ,isMedication : true});
    }