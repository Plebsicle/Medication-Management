import express from 'express';
// import * as fileController from '../controllers/fileController';
import { getUploadUrl, confirmFileUpload, getSharedFiles, deleteSharedFile } from '../controllers/fileController';
import jwtVerification from '../middlewares/jwtVerification';

const router = express.Router();

// All routes require authentication
router.use(jwtVerification);

// Get upload URL
router.post('/upload',  getUploadUrl);

// Confirm file upload
router.post('/confirm',  confirmFileUpload);

// Get shared files
router.get('/', getSharedFiles);

// Delete shared file
router.delete('/:id', deleteSharedFile);

export default router; 