import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post('/', upload.single('profilePhoto'), async (req, res) => {
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
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }

    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const filePath = `/uploads/${req.file.filename}`;
        const user = await prisma.user.update({
            where: { email },
            data: { profile_photo_path: filePath },
        });
        res.status(200).json({
            message: "Profile photo uploaded successfully",
            path: filePath,
        });
    } catch (error) {
        console.error("Error uploading profile photo", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
