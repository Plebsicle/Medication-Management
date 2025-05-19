import  express  from 'express';
import jwt from 'jsonwebtoken'

export default function jwtVerification(req : express.Request,res : express.Response,next: express.NextFunction){

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = req.body.jwt || req.headers['authorization']?.split(' ')[1];
    if (token) {
        token = token.replace(/^"|"$/g, ''); 
    }

    let email;
    console.log(token);
    try {
        const decoded : any = jwt.verify(token, process.env.JWT_SECRET as string) 
        email = decoded.email;
        if (!email) {
            res.status(400).json({ error: "Email not found in token" });
            return;
        }
        req.userId = decoded.userId;
        req.userName = decoded.name;
        req.userEmail = decoded.email;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
}