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
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield prisma.user.findFirst({
            where: {
                email
            }
        });
        if (!user) {
            res.status(404).json({ message: "User Does not Exist , SignUp First", isUser: false });
            return;
        }
        const data = yield prisma.health_records.findMany({
            where: {
                user_id: user.id
            }
        });
        if (!data) {
            res.status(404).json({ message: "Data Not Found", isData: false });
            return;
        }
        res.status(200).json(data);
    }
    catch (error) {
        console.log("Internal Server Erorr in fetching data Backend", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
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
        const user = yield prisma.user.findFirst({
            where: { email },
        });
        if (!user) {
            res.status(404).json({ message: "User does not exist. Please sign up first.", isUser: false });
            return;
        }
        const { record_date, blood_pressure, heart_rate, weight, temperature, notes } = req.body;
        if (!record_date) {
            res.status(400).json({ error: "Record date is required." });
            return;
        }
        const newHealthRecord = yield prisma.health_records.create({
            data: {
                user_id: user.id,
                record_date: new Date(record_date),
                blood_pressure: blood_pressure || null,
                heart_rate: heart_rate ? parseInt(heart_rate, 10) : null,
                weight: weight ? parseFloat(weight) : null,
                temperature: temperature ? parseFloat(temperature) : null,
                notes: notes || null,
            },
        });
        res.status(201).json({ message: "Health record added successfully.", data: newHealthRecord });
    }
    catch (error) {
        console.error("Internal Server Error in Backend", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
exports.default = router;
