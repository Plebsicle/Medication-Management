import express from 'express'
import { getMedicationHistory } from '../../controller/medication/getMedicationHistory';
import jwtVerification from '../../middlewares/jwtVerification';

const router = express.Router();

router.get('/',jwtVerification , getMedicationHistory)

export default router;