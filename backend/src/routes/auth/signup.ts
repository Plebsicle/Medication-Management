import express from 'express';
import { googlePhoneSignup, signup } from '../../controller/auth/signup';


const router = express.Router();

router.post('/',signup );

// Add a new route for Google users to submit their phone number
router.post('/google-phone', googlePhoneSignup);

export default router;
