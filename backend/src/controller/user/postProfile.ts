import prisma from "../../database";
import express from 'express';

export const postProfile =  async (req : express.Request, res : express.Response) => {
    
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No data provided for update" });
        return;
    }
    const email = req.userEmail;
    try {
        // Only allow updating name and profile photo
        const validFields = ["name", "profile_photo_path"];
        const updateData: Record<string, any> = {};  
        for (const key in updates) {
            if (validFields.includes(key)) {
                updateData[key] = updates[key];
            } else {
                res.status(400).json({ error: `Invalid field: ${key}`});
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
}