
import  { Request, Response } from 'express';
import prisma from '../../database';
import { getDocument } from '../../_utilities/aws-s3';


export const getViewDocument = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const documentId = req.params.id;

    // Check if document exists and belongs to user
    const document = await prisma.medicalDocument.findFirst({
      where: {
        id: documentId,
        userId
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
}