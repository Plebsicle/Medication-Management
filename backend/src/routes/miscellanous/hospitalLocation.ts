import express from 'express';
import { getHospitalLocation } from '../../controller/miscellanous/hospitalLocation';

const router = express.Router();



router.post('/', getHospitalLocation);

export default router;