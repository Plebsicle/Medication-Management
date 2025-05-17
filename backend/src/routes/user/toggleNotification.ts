import { Router } from 'express';
import { toggleNotification } from '../../controller/user/toggleNotification';
import jwtVerification from '../../middlewares/jwtVerification';

const router = Router();

router.put('/', jwtVerification, toggleNotification );

export default router;