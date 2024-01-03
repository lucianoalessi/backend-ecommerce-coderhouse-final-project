import { Router } from "express";
import { mailingController } from "../controllers/mailingController.js";
import { passportCall } from '../../utils.js';

const router = Router();

router.get('/', passportCall('jwt'), mailingController);

export default router;