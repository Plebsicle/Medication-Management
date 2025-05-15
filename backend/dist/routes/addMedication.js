"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
var medication_type;
(function (medication_type) {
    medication_type["pills"] = "pills";
    medication_type["syrup"] = "syrup";
    medication_type["injection"] = "injection";
})(medication_type || (medication_type = {}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }
    let token = req.body.jwt || ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
    if (token) {
        token = token.replace(/^"|"$/g, '');
    }
    let email;
    // console.log(token);
    try {
        console.log(token);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        email = decoded.email;
        // console.log(email);
        if (!email) {
            res.status(400).json({ error: "Email not found in token" });
            return;
        }
    }
    catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
    try {
        const { formData } = req.body;
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
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const medication = yield prisma.medication.create({
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
        const medicationTimesData = formData.intakeTimes.map((time) => ({
            medication_id: medication.medication_id,
            intake_time: time,
        }));
        yield prisma.medication_times.createMany({
            data: medicationTimesData,
        });
        const notification = yield prisma.notification.create({
            data: {
                medication_id: medication.medication_id,
                notification_on: formData.notification_on,
                message: `Time to take your medication: ${medication.name}`,
            },
        });
        res.status(200).json({
            message: "Medication added successfully",
        });
    }
    catch (error) {
        console.error("Error In Add Medication Backend", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: "Authorization header is missing" });
            return;
        }
        let token = req.body.jwt || ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
        if (token) {
            token = token.replace(/^"|"$/g, '');
        }
        let email;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            email = decoded.email;
            if (!email) {
                res.status(400).json({ error: "Email not found in token" });
                return;
            }
        }
        catch (error) {
            res.status(401).json({ error: "Invalid or expired token" });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ error: "User not found", isUser: false });
            return;
        }
        const currentDate = new Date();
        const medications = yield prisma.medication.findMany({
            where: {
                user_id: user.id,
                end_date: { gte: currentDate },
            },
            include: {
                medication_times: true,
                notification: true,
            },
        });
        if (!medications) {
            res.status(200).json({ message: "No Active Medications", isMedication: false });
            return;
        }
        const formattedMedications = medications.map((medication) => ({
            medication_id: medication.medication_id,
            name: medication.name,
            type: medication.type,
            dosage: medication.dosage,
            start_date: medication.start_date.toISOString().split('T')[0],
            end_date: medication.end_date.toISOString().split('T')[0],
            frequency: medication.medication_times.length,
            intake_times: medication.medication_times.map((time) => time.intake_time),
            instructions: medication.instructions || "",
            notification_on: medication.notification.some((notif) => notif.notification_on),
        }));
        res.status(200).json({ medications: formattedMedications, isMedication: true });
    }
    catch (e) {
        console.log("Error in Getting Medications", e);
    }
}));
exports.default = router;
