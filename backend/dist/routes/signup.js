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
const zodverification_1 = require("../middlewares/zodverification");
const hash_1 = require("../_utilities/hash");
const googleAuthService_1 = __importDefault(require("../_utilities/googleAuthService"));
const mailer_1 = require("../_utilities/mailer");
const tokenGenerator_1 = __importDefault(require("../_utilities/tokenGenerator"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { googleId } = req.body;
        if (!googleId) {
            const { name, email, role, password } = req.body;
            let zodCheck = yield (0, zodverification_1.verifyUserDetails)(name, email, role, password);
            if (zodCheck) {
                const userPossible = yield prisma.user.findFirst({
                    where: {
                        email
                    }
                });
                if (!userPossible) {
                    const emailToken = (0, tokenGenerator_1.default)();
                    const expiration = new Date();
                    expiration.setHours(expiration.getHours() + 1);
                    const hashedPassword = yield (0, hash_1.hashPassword)(password);
                    console.log(emailToken);
                    const placeholderUser = yield prisma.user.create({
                        data: {
                            email,
                            name,
                            password: hashedPassword,
                            role,
                            verified: false,
                        },
                    });
                    yield prisma.emailverificationtoken.create({
                        data: {
                            user_id: placeholderUser.id,
                            token: emailToken,
                            expiration,
                        },
                    });
                    (0, mailer_1.sendVerificationEmail)(email, emailToken);
                    res.status(202).json({ message: 'Email Verification Pending', isEmailVerified: false });
                }
                else {
                    res.status(202).json({ message: "Email is already in use", EmailinUse: true });
                    return;
                }
            }
            else {
                res.status(202).json({ message: "Entered Details are Not Valid", zodPass: false });
                return;
            }
        }
        else {
            const googleUser = yield (0, googleAuthService_1.default)(googleId);
            if (googleUser) {
                const { email, name, sub: googleId } = googleUser;
                const { role } = req.body;
                if (role && email && name && (yield (0, zodverification_1.verifyGoogleDetails)(name, email, role))) {
                    const userPossible = yield prisma.user.findFirst({ where: { email } });
                    if (!userPossible) {
                        const userCreationResponse = yield prisma.user.create({
                            data: { name, email, role, verified: true }
                        });
                        const token = jsonwebtoken_1.default.sign({ name, email, role }, jwtSecret);
                        res.status(201).json({ jwt: token });
                    }
                    else {
                        res.status(409).json({ message: "Email is already in use", EmailinUse: true });
                        return;
                    }
                }
                else {
                    res.status(400).json({ message: "Google Credentials are Invalid", vaildDetails: false });
                    return;
                }
            }
            else {
                res.status(400).json({ message: "Invalid Google token", vaildDetails: false });
                return;
            }
        }
    }
    catch (e) {
        console.log("Error while signing up", e);
        res.status(500).json({ message: "Internal server error", serverError: true });
    }
}));
exports.default = router;
