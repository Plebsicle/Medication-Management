import { uploadDocument } from "../../_utilities/aws-s3";
import prisma from "../../database";
import {v4 as uuidv4} from 'uuid'
  import express from "express";

export const postProfilePhoto = async (req: express.Request, res: express.Response) => {
    const email = req.userEmail;
    try {
      const { fileType } = req.body;

      if (!fileType) {
        res.status(400).json({ error: "Missing file type" });
        return;
      }

      const fileExtension = fileType.split('/')[1];
      const fileName = `profile-${uuidv4()}.${fileExtension}`;

      // Generate pre-signed URL
      const uploadUrl = await uploadDocument(fileName, fileType);

      // Save S3 path to DB
      const s3Path = `medication/${fileName}`;
      await prisma.user.update({
        where: { email },
        data: { profile_photo_path: s3Path },
      });

      res.status(200).json({
        message: "Upload URL generated",
        uploadUrl,
        path: s3Path,
      });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }