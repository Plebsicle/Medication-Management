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
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }
    let token = authHeader.split(' ')[1];
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
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            path: user.profile_photo_path || null,
        });
    }
    catch (error) {
        console.error("Error in serving profile data", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }
    let token = authHeader.split(' ')[1];
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
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No data provided for update" });
        return;
    }
    try {
        const validFields = ["name", "role", "profile_photo_path"];
        const updateData = {};
        for (const key in updates) {
            if (validFields.includes(key)) {
                updateData[key] = updates[key];
            }
            else {
                res.status(400).json({ error: `Invalid field: ${key}` });
                return;
            }
        }
        const updatedUser = yield prisma.user.update({
            where: { email },
            data: updateData,
        });
        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    }
    catch (error) {
        console.error("Error updating profile", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
