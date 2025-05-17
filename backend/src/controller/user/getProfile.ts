 import jwt from 'jsonwebtoken'
 import {Request,Response} from 'express'
 import prisma from '../../database';

 
 export const getProfile = async (req : Request, res : Response) => {
    const email = req.userEmail;
    try {
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Using type assertion to access all user properties
        const userData = user as any;

        res.status(200).json({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            path: userData.profile_photo_path || null,
            email_notifications: userData.email_notifications,
            sms_notifications: userData.sms_notifications,
        });
    } catch (error) {
        console.error("Error in serving profile data", error);
        res.status(500).json({ error: "Internal server error" });
    }
}