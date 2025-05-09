"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtSecret = process.env.JWT_SECRET;
const router = express_1.default.Router();
router.post('/', (req, res) => {
    var _a;
    try {
        let token = req.body.jwt || ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
        console.log("Original Token:", token);
        if (token) {
            token = token.replace(/^"|"$/g, '');
        }
        console.log("Processed Token:", token);
        if (!token) {
            res.status(202).json({ message: "No Token Received", isTokenPresent: false });
            return;
        }
        const tokenVerified = jsonwebtoken_1.default.verify(token, jwtSecret);
        res.status(200).json({
            message: "Token Verified Successfully",
            isTokenPresent: true,
            tokenVerified,
        });
    }
    catch (e) {
        console.error("JWT Verification Error:", e.name, e.message);
        if (e.name === 'JsonWebTokenError') {
            res.status(401).json({ message: "Invalid Token", isTokenPresent: true });
        }
        else if (e.name === 'TokenExpiredError') {
            res.status(401).json({ message: "Token Expired", isTokenPresent: true });
        }
        else {
            res.status(500).json({ message: "Internal Server Error", isTokenPresent: true });
        }
    }
});
exports.default = router;
