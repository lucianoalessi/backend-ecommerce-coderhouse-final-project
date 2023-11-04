import { Router } from 'express';
import { mockingProducts } from '../controllers/mockingController.js';

const router = Router()

//Ruta para mocking de productos:
router.get('/mockingproducts' , mockingProducts);

export default router;