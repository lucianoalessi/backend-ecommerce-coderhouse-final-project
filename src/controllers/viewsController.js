import cartService from "../services/cartService.js";
import productService from "../services/productService.js";
import UserManager from "../dao/managersMongoDb/UserManagerMongo.js";

const userManager = new UserManager();

//Controllers para las vistas:

//vista de productos home
export const getProducts = async (req,res)=>{
    const listaProductos = await productService.getProducts()
    res.render('home' , {listaProductos, style:'style.css'})
}

//vista de productos en tiempo real con formulario para agregar mas productos. (ruta para handlebars + websockets):
export const getProductsInRealTime = async (req,res) => {
    const listaProductos = await productService.getProducts({})
    res.render('realTimeProducts', {listaProductos, style:'style.css'})
}

//vista para el chat (handlebars + websockets):
export const chatStyle = async (req,res)=>{
    res.render("chat", {style:'style.css'})
}

//Vista de productos con su paginacion (pagination):
export const pagination = async (req, res) => {
	const { limit, page, sort, query } = req.query;
	//const user = req.session.user
	const user = req.user
	const userObjetc = await userManager.getUserById(req.user._id)
	const cart = userObjetc.cart[0]._id
	try {
		const products = await productService.getProductsQuery(
			limit,
			page,
			sort,
			query
		);
		res.render('products', { products: products, user: user , cart:cart , style:'style.css' });
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
}

//Vista del carrito:
export const cartView =  async (req, res) => {
	//const { cid } = req.params;
	//const carrito = await cartService.getCartById(cid); //ACA nos devuelve un objeto de MONGO, por lo cual hay que convertirlo a un objeto plano de JS con toOBJECT
	//const carritoToObj = carrito.toObject() //convertimos el objeto que devuelve mongo en su formato a un objeto plano de javaScript. la alternativa de esto es agregar .lean() en mongo
	try {
		const userId = req.user._id
		const user = await userManager.getUserById(userId)
		const cartId = user.cart[0]._id
		const cart = await cartService.getCartById(cartId);
		if (!cart) {
			return res.status(404).send({ error: 'Cart not found' });
		}
		res.render("cart", { cart: cart , style:'style.css' } ) //si paso el carrito entre llaves no funciona. tampoco puedo cargar los estilos de la vista. nose porque.  
	} catch (error) {
		res.status(500).send({ error: error.message });
		console.log(error)
	}
}


//Rutas de vistas para Sessions: 

//Redirect to '/':
export const redirection = async (req, res) => {
	try {
		res.status(200).redirect('/login');
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
}

//Vista para logearse:
export const loginView = (req, res) => {
	res.render('login' , {style:'style.css'});
}

//Vista para registrarse:
export const registerView = (req, res) => {
	res.render('register' , {style:'style.css'})
}

//Vista para el perfil del usuario:
export const profileView = async (req, res) => {
	//const user = req.session.user
	const userId = req.user._id
	const user = await userManager.getUserById(userId)
	const cartId = user.cart[0]._id
	res.render('profile' , {user: user, cartId,  style:'style.css'});
}

//Vista para el perfil del usuario:
export const purchaseView = (req, res) => {
	res.render('purchase' , {user: user , style:'style.css'});
}



