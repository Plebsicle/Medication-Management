import { Request,Response } from "express";
import prisma from "../../database";
import path from "path";
import { getDocument } from "../../_utilities/aws-s3";

export const getPhotoUrl =  async (req: Request, res: Response) => {
    const email = req.userEmail;
    try {
      // Get user to access their profile photo path
      const user = await prisma.user.findUnique({
        where: { email },
        select: { profile_photo_path: true }
      });

      if (!user || !user.profile_photo_path) {
        res.status(404).json({ error: "Profile photo not found" });
        return;
      }

      // Extract filename from the S3 path
      const pathParts = user.profile_photo_path.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Get the file extension to determine content type
      const fileExt = path.extname(filename).toLowerCase();
      let contentType: string = 'image/jpeg'; // Default
      
      if (fileExt === '.png') {
        contentType = 'image/png';
      } else if (fileExt === '.jpg' || fileExt === '.jpeg') {
        contentType = 'image/jpeg';
      }

      // Get a signed URL for the image
      const url = await getDocument(filename, contentType as any);
      
      res.status(200).json({ url });
    } catch (error) {
      console.error("Error getting profile photo URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }