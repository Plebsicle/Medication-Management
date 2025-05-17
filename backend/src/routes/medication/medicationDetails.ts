import express from 'express'
import { getMedicationDetails } from '../../controller/medication/getMedicationDetail';
import jwtVerification from '../../middlewares/jwtVerification';

const router = express.Router();

router.get('/:id',jwtVerification, getMedicationDetails);

export default router;