import jwt from "jsonwebtoken"
import {Request,Response} from 'express'
import { uploadDocument } from "../../_utilities/aws-s3";

export const postProfileUploadUrl = async (req : Request, res : Response) => {
    
    const userId = req.userId;
    try {
        let {fileName,fileType} = req.body;
        const newFileName = `${userId}-${fileName}`;
        const url = await uploadDocument(newFileName,fileType);
        res.status(200).json({"s3-url" : url });
        return;
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }

    
}