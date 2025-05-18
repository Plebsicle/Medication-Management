import express from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { 
  getSharedFileUploadUrl, 
  getSharedFileViewUrl, 
  deleteSharedFile as deleteS3SharedFile 
} from '../_utilities/aws-s3';

const prisma = new PrismaClient();

export const getUploadUrl = async (req: express.Request, res: express.Response) => {
  try {
    const { doctorId, patientId, fileName, fileType } = req.body;
    const userId = req.userId;

    if (!doctorId || !patientId || !fileName || !fileType) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Validate that the user is either the doctor or the patient
    if (userId !== Number(doctorId) && userId !== Number(patientId)) {
      res.status(403).json({ message: 'Unauthorized to share files in this conversation' });
      return;
    }

    // Generate a unique file key
    const fileKey = `shared-files/${doctorId}_${patientId}/${uuidv4()}_${fileName}`;

    // Generate a presigned URL for file upload using our utility
    const uploadUrl = await getSharedFileUploadUrl(fileKey, fileType);

    // Generate a unique ID for the file 
    const fileId = uuidv4();

    res.status(200).json({
      uploadUrl,
      fileId,
      fileKey
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ message: 'Failed to generate upload URL' });
    return;
  }
};

export const confirmFileUpload = async (req: express.Request, res: express.Response) => {
  try {
    const { doctorId, patientId, fileName, fileKey } = req.body;
    const userId = req.userId;

    if (!doctorId || !patientId || !fileName || !fileKey) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Validate that the user is either the doctor or the patient
    if (userId !== Number(doctorId) && userId !== Number(patientId)) {
      res.status(403).json({ message: 'Unauthorized to share files in this conversation' });
      return;
    }

    // Create a new SharedFile record
    const sharedFile = await prisma.sharedFile.create({
      data: {
        doctorId: Number(doctorId),
        patientId: Number(patientId),
        uploadedBy: Number(userId),
        fileName,
        fileKey
      }
    });

    res.status(201).json({ success: true, file: sharedFile });
  } catch (error) {
    console.error('Error confirming file upload:', error);
    res.status(500).json({ message: 'Failed to confirm file upload' });
    return;
  }
};

export const getSharedFiles = async (req: express.Request, res: express.Response) => {
  try {
    const { doctorId, patientId } = req.query;
    const userId = req.userId;

    if (!doctorId || !patientId) {
      res.status(400).json({ message: 'Missing required query parameters' });
      return;
    }

    // Validate that the user is either the doctor or the patient
    if (userId !== Number(doctorId) && userId !== Number(patientId)) {
      res.status(403).json({ message: 'Unauthorized to access these files' });
      return;
    }

    // Get all shared files between the doctor and patient
    const sharedFiles = await prisma.sharedFile.findMany({
      where: {
        doctorId: Number(doctorId),
        patientId: Number(patientId)
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            profile_photo_path: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate signed URLs for each file
    const filesWithUrls = await Promise.all(
      sharedFiles.map(async (file) => {
        const viewUrl = await getSharedFileViewUrl(file.fileKey);

        return {
          ...file,
          viewUrl,
          canDelete: file.uploadedBy === userId
        };
      })
    );

    res.status(200).json({ files: filesWithUrls });
    return;
  } catch (error) {
    console.error('Error fetching shared files:', error);
    res.status(500).json({ message: 'Failed to fetch shared files' });
    return;
  }
};

export const deleteSharedFile = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id) {
      res.status(400).json({ message: 'File ID is required' });
      return;
    }

    // Find the file
    const file = await prisma.sharedFile.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!file) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    // Check if the user is the uploader
    if (file.uploadedBy !== userId) {
      res.status(403).json({ message: 'Only the uploader can delete this file' });
      return;
    }

    // Delete from S3 using our utility
    await deleteS3SharedFile(file.fileKey);

    // Delete from database
    await prisma.sharedFile.delete({
      where: {
        id: Number(id)
      }
    });

    res.status(200).json({ success: true, message: 'File deleted successfully' });
    return;
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
    return;
  }
}; 