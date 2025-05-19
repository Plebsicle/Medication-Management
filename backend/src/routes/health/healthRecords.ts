import express from 'express'
import { deleteHealthRecords, getHealthRecords, postHealthRecords } from '../../controller/health/healthRecords';
import jwtVerification from '../../middlewares/jwtVerification';

const router = express.Router();

router.get('/',jwtVerification, getHealthRecords);

router.post('/',jwtVerification, postHealthRecords);

router.post('/delete',jwtVerification,deleteHealthRecords)

export default router