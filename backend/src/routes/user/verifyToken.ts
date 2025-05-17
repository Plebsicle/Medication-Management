import express from 'express';
import { verifyToken } from '../../controller/user/verifyToken';

const router = express.Router();

router.post('/', verifyToken);

export default router;
