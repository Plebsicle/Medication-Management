import express from "express";
import { medicationChanges } from "../../controller/medication/medicationChanges";
import jwtVerification from "../../middlewares/jwtVerification";

const router = express.Router();

router.put("/:id",jwtVerification, medicationChanges);


export default router;
