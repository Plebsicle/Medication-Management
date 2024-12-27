import express from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET as string;
const router = express.Router();

router.post('/', (req, res) => {
    try {
        let token = req.body.jwt || req.headers['authorization']?.split(' ')[1];
        console.log("Original Token:", token);

        if (token) {
            token = token.replace(/^"|"$/g, ''); 
        }

        console.log("Processed Token:", token);

        if (!token) {
            res.status(202).json({ message: "No Token Received", isTokenPresent: false });
            return;
        }

        const tokenVerified = jwt.verify(token, jwtSecret);
        
        res.status(200).json({
            message: "Token Verified Successfully",
            isTokenPresent: true,
            tokenVerified,
        });
        
    } catch (e: any) {
        console.error("JWT Verification Error:", e.name, e.message);
        if (e.name === 'JsonWebTokenError') {
            res.status(401).json({ message: "Invalid Token", isTokenPresent: true });
        } else if (e.name === 'TokenExpiredError') {
            res.status(401).json({ message: "Token Expired", isTokenPresent: true });
        } else {
            res.status(500).json({ message: "Internal Server Error", isTokenPresent: true });
        }
    }
});

export default router;
