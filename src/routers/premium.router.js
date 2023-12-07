import { Router } from 'express';
import { loggerController } from '../controllers/loggerController.js';
import { addLogger } from '../utils/logger.js';
import { premiumController, getUsers} from '../controllers/premiumController.js';

const router = Router()

//Ruta para convertir usuario a premium:
router.get('/premium/:uid' , addLogger , premiumController);

//Ruta para obtener usuarios:
router.get('/' , addLogger , getUsers);


export default router;