import { Router } from 'express';
import { addLogger } from '../utils/logger.js';
import { premiumController, getUsers , uploadDocuments , deleteUsers , deleteUser} from '../controllers/usersController.js';
import upload from '../middlewares/multerConfig.js'
import { passportCall} from "../../utils.js";


const router = Router()

// Middleware global para el logger
router.use(addLogger);



//Ruta para convertir usuario a premium:
router.get('/premium/:uid' , passportCall('jwt'), premiumController);

//Ruta para cargar documentos:
router.post('/:uid/documents', upload.array('documents'), uploadDocuments);

//Ruta para obtener usuarios:
router.get('/' , getUsers);

//Ruta para Eliminar usuarios sin conexion mayor a 2 dias:
router.delete('/' , deleteUsers);

//Ruta para Eliminar usuarios por id:
router.get('/:uid' , deleteUser);



export default router;