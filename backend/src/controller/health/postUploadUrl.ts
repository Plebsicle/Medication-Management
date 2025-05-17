import  express  from 'express';
import prisma from '../../database';
import { v4 as uuidv4 } from 'uuid';
import { uploadDocument } from '../../_utilities/aws-s3';



export const postMedicalUrl = async (req: express.Request, res: express.Response) => {
  const userId = req.userId;
  try {
   
    const { name, type, fileType, fileSize } = req.body;
    
    if (!name) {
      res.status(400).json({ error: "Document name is required" });
      return;
    }
    
    if (!fileType) {
      res.status(400).json({ error: "File type is required" });
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(fileType)) {
      res.status(400).json({ error: "Invalid file type. Only JPEG, JPG, PNG and PDF are allowed." });
      return;
    }
    
    // Generate a unique filename with the correct extension
    const fileExtension = fileType === 'application/pdf' ? '.pdf' : `.${fileType.split('/')[1]}`;
    const fileName = `${name}-${req.userId}${fileExtension}`;
    
    // Get presigned URL for upload
    console.log(fileType);
    const uploadUrl = await uploadDocument(fileName, fileType as any);
    
    // Save document record in database (with status pending)
    const s3Path = `medication/${fileName}`;
    const document = await prisma.medicalDocument.create({
      data: {
        name,
        documentType: type || 'other',
        filePath: s3Path,
        fileType,
        fileSize: parseInt(fileSize, 10) || 0,
        user: {
          connect: {
            id: userId
          }
        }
      }
    });

    // Return the presigned URL and document ID to the client
    res.status(200).json({
      uploadUrl,
      documentId: document.id,
      success: true
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}