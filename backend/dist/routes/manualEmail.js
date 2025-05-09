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
const mailer_1 = require("../_utilities/mailer");
const tokenGenerator_1 = __importDefault(require("../_utilities/tokenGenerator"));
const client_1 = require("@prisma/client");
const zodverification_1 = require("../middlewares/zodverification");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const respon = yield (0, zodverification_1.verifyEmailAlone)(email);
        if (!respon) {
            res.status(202).json({ message: "Email is Not valid", zodPass: false });
            return;
        }
        if (!email) {
            res.status(202).json({ message: "No Email Sent", isEmailPresent: false });
            return;
        }
        const emailToken = (0, tokenGenerator_1.default)();
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
        console.log(emailToken);
        const placeholderUser = yield prisma.user.findFirst({
            where: {
                email
            }
        });
        if (!placeholderUser) {
            res.status(202).json({ message: "User has not signed Up yet ", isSignedUp: false });
            return;
        }
        yield prisma.emailverificationtoken.upsert({
            where: {
                user_id: placeholderUser.id,
            },
            update: {
                token: emailToken,
                expiration,
            },
            create: {
                user_id: placeholderUser.id,
                token: emailToken,
                expiration,
            },
        });
        (0, mailer_1.sendVerificationEmail)(email, emailToken);
        res.status(200).json({ message: 'Email Verification Pending', isEmailVerified: false });
    }
    catch (e) {
        console.log("Error in Manual Email Backend", e);
    }
}));
exports.default = router;
