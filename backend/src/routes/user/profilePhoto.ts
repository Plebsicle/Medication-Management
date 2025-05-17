import { Router } from 'express';
import { postProfileUploadUrl } from '../../controller/user/postProfileUploadUrl';
import jwtVerification from '../../middlewares/jwtVerification';

const router = Router();

router.post('/', jwtVerification, postProfileUploadUrl);

export default router;
