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


//ruta para plantilla handlebars
router.get('/', async (req,res)=>{

    const listaProductos = await pmanager.getProducts()
    res.render('home' , {listaProductos, style:'style.css'})
})


//ruta para handlebars + websockets (productos en tiempo real)
router.get('/realtimeproducts' , async (req,res) => {
    const listaProductos = await pmanager.getProducts({})
    res.render('realTimeProducts', {listaProductos, style:'style.css'})

})

//ruta para handlebars + websockets (chat)
router.get("/chat", async (req,res)=>{
    res.render("chat", {style:'style.css'})
})

//vista de productos con su paginacion
router.get("/products", async (req, res) => {

	const { limit, page, sort, query } = req.query;

	try {
		const products = await pmanager.getProductsQuery(
			limit,
			page,
			sort,
			query
		);
		res.render('products', { products: products , style:'style.css' });
	} catch (error) {
		res.status(500).send({ error: error.message });
	}
});

//vista del carrito

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


export default router;




//import { ObjectId } from 'mongodb';
//  const objectId = new ObjectId(cid) 
