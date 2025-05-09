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
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
exports.default = router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const response = yield prisma.user.findFirst({
        where: {
            email
        }
    });
    if (!response) {
        res.status(400).json({
            message: "User is not verified yet",
            isEmailVerified: false
        });
    }
    else {
        if (response.verified === true)
            res.status(200).json({ verified: true });
        else
            res.status(401).json({ verified: false });
    }
}));
