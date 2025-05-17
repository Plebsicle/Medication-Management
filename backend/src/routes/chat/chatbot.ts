import express from 'express';
import { checkAiLimit, } from '../../middlewares/aiLimitMiddleware';
import { AIUsage } from '../../controller/chat/aiUsage';
import {  AIHistory } from '../../controller/chat/aiHistory';
import { AIChat } from '../../controller/chat/aiChat';
import jwtVerification from '../../middlewares/jwtVerification';

const router = express.Router();


router.get('/usage',jwtVerification, AIUsage);
router.post('/history',jwtVerification, AIHistory);
router.post('/prompt',jwtVerification, checkAiLimit,AIChat);

export default router; 