import express from 'express';
import { uploadDocument } from "../../_utilities/aws-s3";

export const postProfileUploadUrl = async (req : express.Request, res : express.Response) => {
    
    const userId = req.userId;
    try {
        let {fileName,fileType} = req.body;
        const newFileName = `${fileName}-${userId}`
        const url = await uploadDocument(newFileName,fileType);
        res.status(200).json({"s3-url" : url });
        return;
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }

    
}