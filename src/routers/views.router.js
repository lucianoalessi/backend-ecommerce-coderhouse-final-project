import  {Router}  from "express";
import __dirname from "../../utils.js";
//ya no usaremos file system, usaremos mongoDB
//import ProductManager from "../ProductManager.js";
import ProductManager from "../dao/managersMongoDb/ProductManagerMongo.js";
import CartManager from "../dao/managersMongoDb/CartsManagerMongo.js";


const router = Router();


// Creación de una instancia de ProductManager con la ruta al archivo JSON de productos en caso de utilizar File System.

//const pmanager = new ProductManager(__dirname +'/files/products.json')
const pmanager = new ProductManager() //instancia utilizando mongoDB
const cmanager = new CartManager() //instancia Cart Manager utilizando mongoDB



//Rutas para las vistas:


//Ruta para la vista de todos los productos (ruta para plantilla handlebars):
router.get('/home', async (req,res)=>{

    const listaProductos = await pmanager.getProducts()
    res.render('home' , {listaProductos, style:'style.css'})
})


//Ruta de productos con formulario para agregar mas productos (ruta para handlebars + websockets):
router.get('/realtimeproducts' , async (req,res) => {
    const listaProductos = await pmanager.getProducts({})
    res.render('realTimeProducts', {listaProductos, style:'style.css'})

})

//Ruta para el chat (handlebars + websockets):
router.get("/chat", async (req,res)=>{
    res.render("chat", {style:'style.css'})
})

//Vista de productos con su paginacion (pagination):
router.get("/products", async (req, res) => {

	const { limit, page, sort, query } = req.query;
	const user = req.session.user

	try {
		const products = await pmanager.getProductsQuery(
			limit,
			page,
			sort,
			query
		);
		res.render('products', { products: products, user: user  , style:'style.css' });
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
});

//Ruta con vista del carrito:

router.get('/carts/:cid', async (req, res) => {
	const { cid } = req.params;
	try {
		const carrito = await cmanager.getCartById(cid); //ACA nos devuelve un objeto de MONGO, por lo cual hay que convertirlo a un objeto plano de JS con toOBJECT
		const carritoToObj = carrito.toObject() //convertimos el objeto que devuelve mongo en su formato a un objeto plano de javaScript. la alternativa de esto es agregar .lean() en mongo
		console.log(carritoToObj)
		if (!carrito) {
			return res.status(404).send({ error: 'Cart not found' });
		}
		res.render("cart", carritoToObj ) //si paso el carrito entre llaves no funciona. tampoco puedo cargar los estilos de la vista. nose porque.  
	} catch (error) {
		res.status(500).send({ error: error.message });
		console.log(error)
	}
});




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
router.get('/', async (req, res) => {
	try {
		res.status(200).redirect('/login');
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

//Vista para logearse:
router.get('/login', sessionExist, (req, res) =>{
	res.render('login' , {style:'style.css'});
})

//Vista para registrarse:
router.get('/register' ,sessionExist, (req, res) => {
	res.render('register' , {style:'style.css'})
})

//Vista para el perfil del usuario:
router.get('/profile' ,checkSession,  (req, res) => {
	const user = req.session.user
	res.render('profile' , {user: user , style:'style.css'});
})

export default router;


 
