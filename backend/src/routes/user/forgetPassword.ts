import express from 'express'
import { postForgetPassword, putForgetPassword } from '../../controller/user/forgetPassword';

const router = express.Router();

router.post('/',postForgetPassword);

router.put('/',putForgetPassword);

export default router;