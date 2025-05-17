import express from 'express'
import { getHealthRecords, postHealthRecords } from '../../controller/health/healthRecords';
import jwtVerification from '../../middlewares/jwtVerification';

const router = express.Router();

router.get('/',jwtVerification, getHealthRecords);

router.post('/',jwtVerification, postHealthRecords);

export default router