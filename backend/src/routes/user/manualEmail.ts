import express from 'express'
import { postIsVerification } from '../../controller/user/verification';

const router = express.Router();

router.post('/',postIsVerification)

export default router;