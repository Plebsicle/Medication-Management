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
const googleAuthService_1 = __importDefault(require("../_utilities/googleAuthService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const zodverification_1 = require("../middlewares/zodverification");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { googleId, email, password } = req.body;
        if (googleId) {
            const payload = yield (0, googleAuthService_1.default)(googleId);
            if (!payload || !payload.email) {
                res.status(202).json({ message: "Invalid Google Token", googleTokenCorrect: false });
                return;
            }
            const email = payload.email;
            console.log(email);
            const name = payload.name;
            let user = yield prisma.user.findFirst({ where: { email } });
            if (user) {
                const jwtToken = jsonwebtoken_1.default.sign({ name: user.name, email: user.email, role: user.role }, jwtSecret);
                res.status(200).json({ jwt: jwtToken });
                return;
            }
            else {
                res.status(202).json({ message: "User not found. Please sign up first.", userFound: false });
                return;
            }
        }
        if (email && password) {
            let zodCheck = yield (0, zodverification_1.verifySigninManualDetails)(email, password);
            if (!zodCheck) {
                res.status(202).json({ message: "Invalid Password or Email", zodPass: false });
                return;
            }
            let user = yield prisma.user.findFirst({ where: { email } });
            if (!user) {
                res.status(202).json({ message: "User not found. Please sign up first.", userFound: false });
                return;
            }
            if (!user.password) {
                res.status(202).json({
                    message: "Password not set. Please update your profile to set a password.",
                    isPasswordSet: false
                });
                return;
            }
            const isVerified = user.verified;
            if (isVerified === false) {
                res.status(202).json({ message: "Please Verify You Email", isEmailVerified: false });
                return;
            }
            const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!passwordMatch) {
                res.status(202).json({ message: "Incorrect password. Please try again.", isPasswordCorrect: false });
                return;
            }
            const jwtToken = jsonwebtoken_1.default.sign({ name: user.name, email: user.email, role: user.role }, jwtSecret);
            res.status(200).json({ jwt: jwtToken });
            return;
        }
        res.status(202).json({ message: "Email and password are required for manual sign-in.", fullDetails: false });
        return;
    }
    catch (error) {
        console.error("Sign-In Error:", error);
        res.status(500).json({ message: "Internal server error", serverError: true });
        return;
    }
}));
exports.default = router;
