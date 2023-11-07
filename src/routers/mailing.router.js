import { Router } from "express";
import { mailingController } from "../controllers/mailingController.js";

const router = Router();

router.get('/', mailingController);

export default router;