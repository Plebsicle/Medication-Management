import express, { Request, Response, NextFunction } from 'express';
import jwtVerification from '../../middlewares/jwtVerification';
import { getProfile } from '../../controller/user/getProfile';
import { updateNotificationPreferences } from '../../controller/user/updateNotificationPreference';
import { postProfile } from '../../controller/user/postProfile';
import { postProfilePhoto } from '../../controller/user/postProfilePhoto';
import { getPhotoUrl } from '../../controller/user/getPhotoUrl';


const router = express.Router();


router.get('/', jwtVerification, getProfile);

router.post('/',jwtVerification,postProfile);

// Add updateNotificationPreferences route to handle notification preference changes
router.post('/updateNotificationPreferences',jwtVerification, updateNotificationPreferences );

// Add route for uploading profile photo using S3
router.post('/profilePhoto',jwtVerification,postProfilePhoto);

// Add route to get a signed URL for the profile photo
router.get('/getPhotoUrl', jwtVerification,getPhotoUrl);

export default router;
