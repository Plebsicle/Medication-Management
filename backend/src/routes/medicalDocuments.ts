import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { uploadDocument, getDocument } from '../_utilities/aws-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import prisma from '../database';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

const router = express.Router();

// Helper middleware for token authentication
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authorization header is missing" });
    return;
  }

  let token = authHeader.split(' ')[1]; 
  if (token) {
    token = token.replace(/^"|"$/g, ''); 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, userId: string };
    (req as AuthenticatedRequest).user = { 
      email: decoded.email,
      id: parseInt(decoded.userId, 10) // Convert string ID to number
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
};

// Get all documents for a user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Get documents from database
    const documents = await prisma.medicalDocument.findMany({
      where: {
        userId: authReq.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate signed URLs for each document if needed
    const documentsWithUrls = await Promise.all(documents.map(async (doc: any) => {
      // For each document, get a signed URL for viewing
      const filename = doc.filePath.split('/').pop();
      let contentType = 'application/pdf';
      
      if (doc.fileType.includes('image')) {
        contentType = doc.fileType;
      }
      
      const url = await getDocument(filename, contentType as any);
      
      return {
        id: doc.id,
        name: doc.name,
        type: doc.fileType,
        filename: filename,
        url: url,
        uploadDate: doc.createdAt
      };
    }));

    res.status(200).json({ documents: documentsWithUrls });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a presigned URL for document upload
router.post('/getUploadUrl', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
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
    const fileName = `document-${uuidv4()}${fileExtension}`;
    
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
            id: authReq.user.id
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
});

// Confirm upload completion
router.post('/:id/confirmUpload', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const documentId = req.params.id;
    
    // Check if document exists and belongs to user
    const document = await prisma.medicalDocument.findFirst({
      where: {
        id: documentId,
        userId: authReq.user.id
      }
    });

    if (!document) {
      res.status(404).json({ error: "Document not found or access denied" });
      return;
    }
    
    // Update document status to completed
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { 
        updatedAt: new Date()
        // Add any additional fields you want to update
      }
    });

    res.status(200).json({
      success: true,
      message: "Document upload confirmed"
    });
  } catch (error) {
    console.error("Error confirming upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single document
router.get('/:id/view', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const documentId = req.params.id;

    // Check if document exists and belongs to user
    const document = await prisma.medicalDocument.findFirst({
      where: {
        id: documentId,
        userId: authReq.user.id
      }
    });

    if (!document) {
      res.status(404).json({ error: "Document not found or access denied" });
      return;
    }

    // Generate signed URL for viewing
    const filename = document.filePath.split('/').pop() as string;
    const url = await getDocument(filename, document.fileType as any);

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error getting document URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a document
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const documentId = req.params.id;

    // Check if document exists and belongs to user
    const document = await prisma.medicalDocument.findFirst({
      where: {
        id: documentId,
        userId: authReq.user.id
      }
    });

    if (!document) {
      res.status(404).json({ error: "Document not found or access denied" });
      return;
    }

    // Delete from database
    await prisma.medicalDocument.delete({
      where: {
        id: documentId
      }
    });

    // Note: We're not deleting from S3 as files might be referenced elsewhere
    // In a production app, you might want to implement S3 object deletion as well

    res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 