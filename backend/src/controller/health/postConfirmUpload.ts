import express from 'express';
import prisma from '../../database';



export const postConfirmUpload = async (req: express.Request, res: express.Response) => {
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
}