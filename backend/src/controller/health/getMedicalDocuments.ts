import  { Request, Response } from 'express';
import { getDocument } from '../../_utilities/aws-s3';
import prisma from '../../database';



export const getMedicalDocuments = async (req: Request, res: Response) => {
  const userId  = req.userId;
  try {
    // Get documents from database
    const documents = await prisma.medicalDocument.findMany({
      where: {
        userId
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
}