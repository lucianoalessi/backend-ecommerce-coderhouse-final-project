import { Router } from 'express';
import { addLogger } from '../utils/logger.js';
import { premiumController, getUsers , uploadDocuments , deleteUsers , deleteUser} from '../controllers/usersController.js';
import upload from '../middlewares/multerConfig.js'


const router = Router()

//Ruta para convertir usuario a premium:
router.get('/premium/:uid' , addLogger , premiumController);

//Ruta para cargar documentos:
router.post('/:uid/documents', upload.array('documents'), uploadDocuments);

//Ruta para obtener usuarios:
router.get('/' , addLogger , getUsers);

//Ruta para Eliminar usuarios sin conexion mayor a 2 dias:
router.delete('/' , addLogger , deleteUsers);

//Ruta para Eliminar usuarios por id:
router.get('/:uid' , addLogger , deleteUser);



export default router;