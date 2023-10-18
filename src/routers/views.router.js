import  {Router}  from "express";
import __dirname from "../../utils.js";


const router = Router();


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


//Rutas para las vistas:


//Ruta para la vista de todos los productos (ruta para plantilla handlebars):
router.get('/home', getProducts )

//Ruta de productos con formulario para agregar mas productos (ruta para handlebars + websockets):
router.get('/realtimeproducts' , getProductsInRealTime );

//Ruta para el chat (handlebars + websockets):
router.get("/chat", chatStyle );

//Vista de productos con su paginacion (pagination):
router.get("/products", pagination );

//Ruta con vista del carrito:
router.get('/carts/:cid', cartView );


//Vistas para Sessions y Middlewares:

//Middleware para verificar la session.(si se intenta ingresar a alguna de las otras rutas te trae directamente a la ruta: '/login'):
const checkSession = (req, res, next) => {
	if (!req.session.user) {
		// La sesión ha expirado o el usuario no ha iniciado sesión, redirige a la página de inicio de sesión
		res.clearCookie('connect.sid');
		return res.redirect('/login');
	}

	next(); // Continúa con la siguiente función de middleware o ruta
}

//Middleware para verificar si hay session activa y evitar acceder a login y register:
const sessionExist = (req, res, next) => {
	if (req.session.user) {
		// Si hay una sesión activa y el usuario intenta acceder a /login o /register,
		// redirige automáticamente a la página de inicio (por ejemplo, /home)
		return res.redirect('/home');
	}
	// Si la sesión no está activa, permite el acceso a /login y /register
	next();
}

//Middleware para permisos de user y admin:
const permission = (req, res, next) => {
	if (req.session.user.rol === 'user') {
		const requestedUrl = req.originalUrl;

		// Redirige al usuario a la página de inicio con un mensaje de error que incluye la URL
		return res.redirect(
			`/home?message=No%20tienes%20permisos%20para%20ingresar%20a%20${requestedUrl}.`
		);
	}
	next();
}

//Rutas para Session: 

//Redirect to '/':
router.get('/', redirection);

//Vista para logearse:
router.get('/login', sessionExist, loginView);

//Vista para registrarse:
router.get('/register' ,sessionExist, registerView);

//Vista para el perfil del usuario:
router.get('/profile' ,checkSession, profileView);

export default router;


 






//FILE SYSTEM

//ya no usaremos file system, usaremos mongoDB
//import ProductManager from "../ProductManager.js";

// Creación de una instancia de ProductManager con la ruta al archivo JSON de productos en caso de utilizar File System.
//const pmanager = new ProductManager(__dirname +'/files/products.json')

