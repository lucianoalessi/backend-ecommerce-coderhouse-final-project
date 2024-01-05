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
	profileView, 
	resetPasswordView,
	newPasswordView,
	uploadDocumentView,
	purchaseView,
	usersAdminManager
} from "../controllers/viewsController.js";
//Importamos middlewares:
import { applyPolicy,  privateAccess, redirectAdmin ,sessionExist ,publicAccess } from "../middlewares/authMiddleware.js";
import { passportCall , passportCallForHome} from "../../utils.js";



//Inicializamos la extencion de express: Router
const router = Router();


//RUTAS para las vistas:

//Ruta para la vista de todos los productos (ruta para plantilla handlebars):
router.get('/home',passportCallForHome('jwt'), sessionExist , applyPolicy(['PUBLIC']), getProducts );

//Vista de productos con su paginacion (pagination):
router.get("/products",passportCall('jwt'), redirectAdmin, applyPolicy(['USER' , 'PREMIUM']), pagination );

//Ruta de productos con formulario para agregar mas productos (ruta para handlebars + websockets):
router.get('/realtimeproducts' ,passportCall('jwt'), applyPolicy(['ADMIN' , 'PREMIUM']), getProductsInRealTime );

//Ruta con vista del carrito:
router.get('/carts/:cid',passportCall('jwt'), cartView );

//vista purchase:
router.get('/carts/:cid/purchase', passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), privateAccess, purchaseView);

//Ruta para el chat (handlebars + websockets):
router.get("/chat",passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), chatStyle );


//RUTAS para Session: 

//Redirect to '/':
router.get('/', redirection);

//Vista para logearse:
router.get('/login',passportCallForHome('jwt'), sessionExist , loginView);

//Vista para registrarse:
router.get('/register',passportCallForHome('jwt'), sessionExist , registerView);

//Vista para restablecer password:
router.get('/resetpassword', resetPasswordView);

//Vista para ingresar un nuevo password:
router.get('/newpassword/:pid', newPasswordView);

//vista para cargar documentos:
router.get('/api/users/:uid/documents', passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), privateAccess, uploadDocumentView);

//Vista para el perfil del usuario:
//NOTA: le agregamos el middleware passportcall('jwt) para que pueda obtener los datos del usuario en token a travez de req.user
router.get('/profile', passportCall('jwt'),applyPolicy(['USER' , 'PREMIUM']), privateAccess, profileView);

//Vista para administrar usuarios:
router.get('/usersadminmanager', passportCall('jwt'),applyPolicy(['ADMIN']), privateAccess, usersAdminManager);

export default router;


 










//FILE SYSTEM

//ya no usaremos file system, usaremos mongoDB
//import ProductManager from "../ProductManager.js";

// Creación de una instancia de ProductManager con la ruta al archivo JSON de productos en caso de utilizar File System.
//const pmanager = new ProductManager(__dirname +'/files/products.json')

