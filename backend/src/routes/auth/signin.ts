import express from "express";
import { signin } from "../../controller/auth/signin";
const router = express.Router();

router.post("/", signin);

export default router;
