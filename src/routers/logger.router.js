import { Router } from 'express';
import { loggerController } from '../controllers/loggerController.js';
import { addLogger } from '../utils/logger.js';

const router = Router()

//Ruta para logger:
router.get('/' , addLogger , loggerController);

export default router;