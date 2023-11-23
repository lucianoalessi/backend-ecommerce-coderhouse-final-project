import { Router } from 'express';
import { loggerController } from '../controllers/loggerController.js';
import { addLogger } from '../utils/logger.js';
import { premiumController } from '../controllers/premiumController.js';

const router = Router()

//Ruta para logger:
router.get('/premium/:uid' , addLogger , premiumController);

export default router;