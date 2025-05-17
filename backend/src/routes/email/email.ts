import express from "express";
import { emailVerification } from "../../controller/email/emailVerification";

const router = express.Router();

router.post("/",emailVerification );

export default router;
