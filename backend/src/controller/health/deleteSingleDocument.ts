import  express  from 'express';
import prisma from '../../database';
import { deleteDocument } from '../../_utilities/aws-s3';


export const deleteSingleDocument =  async (req: express.Request, res: express.Response) => {
  const userId = req.userId;
  try {
    const documentId = req.params.id;
    const {filename} = req.body;
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
    const deletionResponse = await prisma.medicalDocument.delete({
      where: {
        id: documentId
      }
    });

    const fileName = deletionResponse.filePath.split('/').pop()!;

    await deleteDocument(fileName);
    res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}