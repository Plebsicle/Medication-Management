import express, { Request, Response } from 'express';
import prisma from '../../database';
import jwtVerification from '../../middlewares/jwtVerification';
import { getMedicalDocuments } from '../../controller/health/getMedicalDocuments';
import { postConfirmUpload } from '../../controller/health/postConfirmUpload';
import { postMedicalUrl } from '../../controller/health/postUploadUrl';
import { getViewDocument } from '../../controller/health/getViewDocument';
import { deleteSingleDocument } from '../../controller/health/deleteSingleDocument';



const router = express.Router();

// Helper middleware for token authentication

// Get all documents for a user
router.get('/', jwtVerification, getMedicalDocuments);

// Get a presigned URL for document upload
router.post('/getUploadUrl', jwtVerification, postMedicalUrl);

// Confirm upload completion
router.post('/:id/confirmUpload', jwtVerification, postConfirmUpload);

// Get a single document
router.get('/:id/view', jwtVerification, getViewDocument);

// Delete a document
router.delete('/:id', jwtVerification,deleteSingleDocument);

export default router; 