import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = authHeader.split(' ')[1]; 
    if (token) {
        token = token.replace(/^"|"$/g, ''); 
    }

    let email: string | undefined;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };

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
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            role: user.role,
            path: user.profile_photo_path || null, 
        });
    } catch (error) {
        console.error("Error in serving profile data", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = authHeader.split(' ')[1]; 
    if (token) {
        token = token.replace(/^"|"$/g, ''); 
    }

    let email;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        email = decoded.email;

        if (!email) {
            res.status(400).json({ error: "Email not found in token" });
            return;
        }
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }

    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No data provided for update" });
        return;
    }

    try {
        const validFields = ["name", "role", "profile_photo_path"];
        const updateData: Record<string, any> = {}; 

        for (const key in updates) {
            if (validFields.includes(key)) {
                updateData[key] = updates[key];
            } else {
                res.status(400).json({ error: `Invalid field: ${key}` });
                return;
            }
        }
        const updatedUser = await prisma.user.update({
            where: { email },
            data: updateData,
        });

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
