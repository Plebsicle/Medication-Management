import express from 'express';
import { getMedication, postMedication } from '../../controller/medication/addMedication';
import { deleteMedication } from '../../controller/medication/deleteMedication';
import jwtVerification from '../../middlewares/jwtVerification';
const router = express.Router();


router.post('/',jwtVerification, postMedication);
router.get('/', jwtVerification,getMedication);
router.post('/',jwtVerification, deleteMedication);


export default router;
