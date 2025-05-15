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
        if (!token) {
            res.status(202).json({ message: "No Token Received", isTokenPresent: false });
            return;
        }
        // Remove any quotes that might be present
        token = token.replace(/^"|"$/g, '');
        // Check if token is a valid JWT format
        if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
            console.error("Invalid JWT format detected");
            res.status(401).json({
                message: "Invalid Token Format",
                isTokenPresent: true,
                error: "Token is not in valid JWT format"
            });
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
        console.error("JWT Verification Error:", {
            name: e.name,
            message: e.message,
            token: req.body.jwt || req.headers['authorization']
        });
        if (e.name === 'JsonWebTokenError') {
            res.status(401).json({
                message: "Invalid Token",
                isTokenPresent: true,
                error: e.message
            });
        }
        else if (e.name === 'TokenExpiredError') {
            res.status(401).json({
                message: "Token Expired",
                isTokenPresent: true,
                error: e.message
            });
        }
        else {
            res.status(500).json({
                message: "Internal Server Error",
                isTokenPresent: true,
                error: e.message
            });
        }
    }
});
exports.default = router;
