import { Request,Response } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET as string;

export const verifyToken = (req : Request, res : Response) => {
    try {
            let token = req.body.jwt || req.headers['authorization']?.split(' ')[1];
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

            const tokenVerified = jwt.verify(token, jwtSecret);
            
        res.status(200).json({
            message: "Token Verified Successfully",
            isTokenPresent: true,
            tokenVerified,
        });
        
    } catch (e: any) {
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
        } else if (e.name === 'TokenExpiredError') {
            res.status(401).json({ 
                message: "Token Expired", 
                isTokenPresent: true,
                error: e.message
            });
        } else {
            res.status(500).json({ 
                message: "Internal Server Error", 
                isTokenPresent: true,
                error: e.message
            });
        }
    }
}