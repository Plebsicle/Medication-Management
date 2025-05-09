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
const mailer_1 = require("../_utilities/mailer");
const hash_1 = require("../_utilities/hash");
const zodverification_1 = require("../middlewares/zodverification");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const receivedEmail = body.email;
        const zodCheck = yield (0, zodverification_1.verifyEmailAlone)(receivedEmail);
        if (!zodCheck) {
            res.status(401).json({ message: "Entered Email Does not Match Criteria", zodPass: false });
            return;
        }
        (0, mailer_1.sendResetPassword)(receivedEmail);
        res.status(201).json({ message: "Email Sent", isEmailSent: true });
    }
    catch (error) {
        console.log("Error in forget Password Backend", error);
        res.status(500).json("Internal Server Error ");
    }
}));
router.put('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const { email, password } = body;
        const zodCheck = yield (0, zodverification_1.verifySigninManualDetails)(email, password);
        if (!zodCheck) {
            res.status(401).json({ message: "Zod Failed", zodPass: false });
            return;
        }
        const user = yield prisma.user.findFirst({
            where: { email }
        });
        if (!user) {
            res.status(401).json({ message: "User Has Signed In Yet", isUserPresent: false });
            return;
        }
        const hashedPassword = yield (0, hash_1.hashPassword)(password);
        const response = yield prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedPassword
            }
        });
        res.status(200).json({ message: "Password Changed successfully", passwordChanged: true });
    }
    catch (error) {
        console.log(error);
        res.status(500).json("Internal Server Error");
    }
}));
exports.default = router;
