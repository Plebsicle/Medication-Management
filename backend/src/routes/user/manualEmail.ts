import express from 'express'
import { postIsVerification } from '../../controller/user/verification';
import { postManualEmail } from '../../controller/user/manualEmail';

const router = express.Router();

router.post('/',postIsVerification)
router.post('/verifyEmail',postManualEmail);

export default router;