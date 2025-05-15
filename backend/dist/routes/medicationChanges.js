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
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log(req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }
    let token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "No Token Found", isTokenPresent: true });
        return;
    }
    if (token) {
        token = token.replace(/^"|"$/g, "");
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
    const { medication_id, type, dosage, start_date, end_date, instructions, intake_times, notification, frequency, } = req.body;
    try {
        const user = yield prisma.user.findFirst({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User does not exist. Please sign up first." });
            return;
        }
        const medication = yield prisma.medication.findUnique({
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
        const updatedMedication = yield prisma.medication.update({
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
                    create: intakeTimesArray.map((time) => ({
                        intake_time: time,
                    })),
                },
                notification: {
                    updateMany: {
                        where: { medication_id: medication.medication_id },
                        data: {
                            notification_on: ((_b = notification[0]) === null || _b === void 0 ? void 0 : _b.notification_on) || false,
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
    }
    catch (error) {
        console.error("Error updating medication details:", error);
        res.status(500).json({ error: "Failed to update medication details" });
    }
}));
exports.default = router;
