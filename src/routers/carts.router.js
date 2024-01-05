// Importando los módulos y clases necesarios.
import { Router } from "express"; 
import { 
	getAllCarts,
	createNewCart, 
	getCartById, 
	addProductToCart,
	deleteProdInCart, 
	deleteAllProductsInCart, 
	addProductsToCart,
	modifyProductQuantity,
	purchase
} from "../controllers/cartController.js";
//importamos middlewares:
import { passportCall } from "../../utils.js";
//importamos middleware para logger:
import { addLogger } from "../utils/logger.js";


//Creando una nueva instancia de Router.
const router = Router();

// Middleware global para el logger
router.use(addLogger);


//RUTAS O ENDPOINTS:

// Ruta para manejar las solicitudes GET para obtener todos los carritos. (La misma sirve para mongoDB y file system)
router.get('/' , getAllCarts);

// Ruta para manejar las solicitudes POST para agregar un nuevo carrito. (La misma sirve para mongoDB y file system)
router.post('/', createNewCart);

// Ruta para manejar las solicitudes GET para obtener un carrito específico por su ID. (La misma sirve para mongoDB y file system)
router.get('/:cid' , getCartById);

// Ruta para manejar las solicitudes POST para agregar un producto a un carrito específico. (La misma sirve para mongoDB y file system)
router.post('/:cid/product/:pid' , passportCall('jwt'), addProductToCart);

// Ruta para eliminar un producto de un carrito
router.delete('/:cid/product/:pid', passportCall('jwt'), deleteProdInCart);

// Ruta para vaciar un carrito
router.delete('/:cid', passportCall('jwt'), deleteAllProductsInCart);

// Ruta para agregar un array de productos
router.put('/:cid', passportCall('jwt'), addProductsToCart);

// Ruta para modificar cantidad del producto
router.put('/:cid/product/:pid', passportCall('jwt'), modifyProductQuantity);

//Ruta para tickets (finalizar compra):
router.get('/:cid/purchase', passportCall('jwt'), purchase);


export default router;







//FILE SYSTEM

//Ahora utilizaremos MONGO DB, asi que comentamos la importacion de FILE SYSTEM:
//import CartManager from "../CartManager.js"; // Importando la clase CartManager 


// Creando una nueva instancia de CartManager Y ProductManager. En caso de utilizar FILE SYSTEM agregamos la ruta del archivo.
//const cmanager = new CartManager(__dirname +'/files/cart.json');

// // Ruta para manejar las solicitudes GET para obtener todos los carritos. (La misma sirve para mongoDB y file system)
// router.get('/' , async (req, res) => {
// 	try{
// 		const carts = await cmanager.getCarts(); // Llamamos al método getCarts de la instancia de CartManager para obtener los carritos y los guardamos en la variable carts
// 		res.status(200).send({status:'success' , carts });  // Enviando una respuesta con los carritos obtenidos.
// 	}catch (error) {
// 		res.status(400).send({ error: error.message });
// 	}
// })


// // Ruta para manejar las solicitudes POST para agregar un nuevo carrito. (La misma sirve para mongoDB y file system)
// router.post('/', async (req, res) => {
// 	try{
// 		const newCart = req.body; // Obteniendo los datos del carrito desde el cuerpo de la solicitud y los guardamos en la variable newCart. 
// 		const addcart = await cmanager.addCart(newCart); // Llamando al método addCart de la instancia de CartManager para agregar un carrito y lo guaramos en una variable.
//     	res.status(200).send({status:'success'}); // Enviando una respuesta indicando el éxito al agregar el carrito.
// 	}catch (error) {
// 		res.status(400).send({ error: error.message });
// 	}
// })


// // Ruta para manejar las solicitudes GET para recuperar un carrito específico por su ID. (La misma sirve para mongoDB y file system)
// router.get('/:cid' , async (req, res) => {

// 	try{
// 		const cartID = req.params.cid; // Obteniendo el ID del carrito desde el parámetro (params) de la URL.
// 		const getCart = await cmanager.getCartById(+cartID); // Llamando al método getCartById de la instancia de CartManager. Agregamos un + en (+cart) para convertirlo en entero y que no se pase un string como parametro. 
		
// 		if (!getCart) {
// 			throw new Error(`Carrito con el id ${cartID} no existe`);
// 		}
		
// 		const getProductsCart = getCart.products; // Obteniendo los productos del carrito recuperado.
// 		res.status(200).send({status:'success' , getProductsCart }); // Enviando una respuesta con los productos recuperados.

// 	}catch (error) {
// 		res.status(400).send({ error: error.message });
// 	}
// })

// // Ruta para manejar las solicitudes POST para agregar un producto a un carrito específico. (La misma sirve para mongoDB y file system)
// router.post('/:cid/product/:pid' , async (req, res) => {

// 	try {
// 		const cart = req.params.cid; // Obteniendo el ID del carrito desde el parámetro de la URL.
// 		const product = req.params.pid; // Obteniendo el ID del producto desde el parámetro de la URL.
	
// 		const addProductToCart = await cmanager.addProductToCart(cart, product); // Llamando al método addProductToCart de la instancia de CartManager.
	
// 		res.status(200).send({status:'success: producto agregado al carrito correctamente'}); // Enviando una respuesta indicando el éxito al agregar el producto al carrito.
		
// 	} catch (error) {
// 		res.status(400).send({ error: error.message });
// 	}
// })


// router.delete('/:cid/product/:pid' , async (req, res) => {

//     try {
//         // Extraer los parámetros de la URL: cid (ID del carrito) y pid (ID del producto)
//         const { cid, pid } = req.params;
  
//         // Verificar si el producto con el ID pid existe
//         const checkIdProduct = await pmanager.getProductById(pid);
//         if (!checkIdProduct) {
//             return res.status(404).send({ status: 'error', message: `Product with ID: ${pid} not found` });
//         }
  
//         // Verificar si el carrito con el ID cid existe
//         const checkIdCart = await cmanager.getCartById(cid);
//         if (!checkIdCart) {
//             return res.status(404).send({ status: 'error', message: `Cart with ID: ${cid} not found` });
//         }
  
//         // Buscar el índice del producto en la lista de productos del carrito
//         const findProductIndex = checkIdCart.products.findIndex(item => item.productID.toString() == checkIdProduct._id);
//         if (findProductIndex === -1) {
//             return res.status(404).send({ status: 'error', message: `Product with ID: ${pid} not found in cart`});
//         }
  
//         // Eliminar el producto de la lista de productos del carrito
//         checkIdCart.products.splice(findProductIndex, 1);
  
//         // Actualizar el carrito en la base de datos sin el producto eliminado
//         const updatedCart = await cmanager.deleteProductInCart(cid, checkIdCart.products);
  
//         return res.status(200).send({ status: 'success', message: `Deleted product with ID: ${pid}`, cart: updatedCart });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({ status: 'error', message: 'An error occurred while processing the request' });
//     }
// })
