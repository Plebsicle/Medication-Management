import  { Request, Response } from 'express';
import prisma from '../../database';



export const deleteSingleDocument =  async (req: Request, res: Response) => {
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
}