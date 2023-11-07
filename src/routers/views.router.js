import  {Router}  from "express";
import __dirname from "../../utils.js";
//importamos los controllers de las vistas:
import { 
	getProducts, 
	getProductsInRealTime, 
	chatStyle, 
	pagination, 
	cartView, 
	redirection, 
	loginView , 
	registerView , 
	profileView 
} from "../controllers/viewsController.js";
//Importamos middlewares:
import { privateAccess, authorization, redirectAdmin} from "../middlewares/auth.js";
import { passportCall } from "../../utils.js";



//Inicializamos la extencion de express: Router
const router = Router();


//RUTAS para las vistas:

//Ruta para la vista de todos los productos (ruta para plantilla handlebars):
router.get('/home', getProducts );

//Ruta de productos con formulario para agregar mas productos (ruta para handlebars + websockets):
router.get('/realtimeproducts' ,passportCall('jwt'), authorization('admin'), getProductsInRealTime );

//Ruta para el chat (handlebars + websockets):
router.get("/chat",passportCall('jwt'), authorization('user'), chatStyle );

//Vista de productos con su paginacion (pagination):
router.get("/products",passportCall('jwt'),redirectAdmin, authorization('user'), pagination );

//Ruta con vista del carrito (sin estilo, porque no le puede pasar el estilo a /:cid):
router.get('/carts/:cid',passportCall('jwt'), cartView );
//ruta con vista del carrito (con estilo)
router.get('/cart/',passportCall('jwt'), cartView ); 

//RUTAS para Session: 

//Redirect to '/':
router.get('/', redirection);

//Vista para logearse:
router.get('/login', loginView);

//Vista para registrarse:
router.get('/register', registerView);

//Vista para el perfil del usuario:
//NOTA: le agregamos el middleware passportcall('jwt) para que pueda obtener los datos del usuario en token a travez de req.user
router.get('/profile', passportCall('jwt'),authorization('user'), privateAccess, profileView);

export default router;


 






//FILE SYSTEM

//ya no usaremos file system, usaremos mongoDB
//import ProductManager from "../ProductManager.js";

// Creación de una instancia de ProductManager con la ruta al archivo JSON de productos en caso de utilizar File System.
//const pmanager = new ProductManager(__dirname +'/files/products.json')

