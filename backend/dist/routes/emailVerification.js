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
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const jwtSecret = process.env.JWT_SECRET;
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Email Verification Endpoint Hit");
        const token = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
        console.log("Received Token:", token);
        if (!token) {
            res.status(400).json({ message: "Invalid token." });
        }
        const tokenRecord = yield prisma.emailverificationtoken.findFirst({
            where: { token: token },
            include: { user: true },
        });
        console.log("Retrieved Token Record:", tokenRecord);
        if (!tokenRecord) {
            res.status(400).json({ message: "Invalid or expired token." });
            return;
        }
        if (tokenRecord.expiration < new Date()) {
            res.status(400).json({ message: "Expired token." });
        }
        if (!tokenRecord.user) {
            res.status(400).json({ message: "User associated with the token does not exist." });
        }
        const user = tokenRecord.user;
        const updatedUser = yield prisma.user.update({
            where: { id: user.id },
            data: { verified: true },
        });
        console.log("User Verified:", updatedUser);
        const jwtPayload = {
            userId: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        };
        console.log(jwtPayload);
        const jwtToken = jsonwebtoken_1.default.sign(jwtPayload, jwtSecret);
        console.log(jwtToken);
        res.status(200).json({
            message: "Email verified successfully.",
            jwt: jwtToken,
        });
        try {
            yield prisma.emailverificationtoken.delete({ where: { token_id: tokenRecord.token_id, user_id: tokenRecord.user_id } });
            console.log("Token deleted successfully.");
        }
        catch (deleteError) {
            if (deleteError.code === "P2025") {
                console.warn("Token already deleted or does not exist.");
            }
            else {
                throw deleteError;
            }
        }
    }
    catch (error) {
        console.error("Error during email verification:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "An error occurred. Please try again." });
        }
    }
}));
exports.default = router;
