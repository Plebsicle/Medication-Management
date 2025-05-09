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
    try {
        const { medicationFull } = req.body;
        if (!medicationFull) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }
        const { medication_id, name, type, dosage, start_date, end_date } = medicationFull;
        if (!name || !type || !dosage || !start_date || !end_date || !medication_id) {
            res.status(400).json({ error: "Incomplete medication details" });
            return;
        }
        const medication = yield prisma.medication.findFirst({
            where: {
                medication_id
            },
        });
        if (!medication) {
            res.status(404).json({ error: "Medication not found" });
            return;
        }
        yield prisma.medication.delete({
            where: { medication_id: medication.medication_id },
        });
        res.status(200).json({ message: "Medication deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting medication", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
exports.default = router;
