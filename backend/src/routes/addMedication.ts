import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; 
const router = express.Router();
const prisma = new PrismaClient();

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
    start_date: string;
    end_date: string;
    frequency: number;
    intake_times: string[];
    instructions: string;
    notification_on: boolean;
};

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
        const { formData} = req.body;
        console.log(req.body);
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
                start_date: new Date(formData.start_date),
                end_date: new Date(formData.end_date),
                instructions: formData.instructions,
            },
        });

        const medicationTimesData = formData.intake_times.map((time : any) => ({
            medication_id: medication.medication_id,
            intake_time: new Date(`1970-01-01T${time}:00`), 
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
});


router.get('/',async (req,res)=>{
    try{
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
        start_date: medication.start_date.toISOString().split('T')[0],
        end_date: medication.end_date.toISOString().split('T')[0],
        frequency: medication.medication_times.length, 
        intake_times: medication.medication_times.map((time) => time.intake_time.toISOString().split('T')[1]),
        instructions: medication.instructions || "",
        notification_on: medication.notification.some((notif) => notif.notification_on),
    }));

    res.status(200).json({ medications: formattedMedications ,isMedication : true});
    }
    catch(e){
        console.log("Error in Getting Medications" , e);
    }
});

export default router;
