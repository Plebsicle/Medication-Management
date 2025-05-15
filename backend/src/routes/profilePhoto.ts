import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import prisma from '../database';
import {uploadDocument} from '../_utilities/aws-s3';

const router = Router();

router.post('/', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = req.headers['authorization']?.split(' ')[1];
    if(!token){
        res.status(400).json({message : "Token Not Found",isTokenpresent : false});
        return;
    }
    if (token) {
        token = token.replace(/^"|"$/g, '');
    }

    let email;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        email = decoded.email;

        if (!email) {
            res.status(400).json({ error: "Email not found in token" });
            return;
        }
        const userId = decoded.userId;
        let {fileName,fileType} = req.body;
        const newFileName = `${userId}-${fileName}`;
        const url = await uploadDocument(newFileName,fileType);
        res.status(200).json({"s3-url" : url });
        return;
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }

    
});

export default router;
