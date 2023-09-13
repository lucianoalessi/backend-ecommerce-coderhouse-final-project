// Importando los módulos y clases necesarios.
import { Router } from "express"; // Importando la clase Router del módulo "express".
import __dirname from '../../utils.js' // Importando la constante __dirname.

//Ahora utilizaremos MONGO DB, asi que comentamos la importacion de FILE SYSTEM:

//import CartManager from "../CartManager.js"; // Importando la clase CartManager 
import CartManager from "../dao/managersMongoDb/CartsManagerMongo.js";
import ProductManager from "../dao/managersMongoDb/ProductManagerMongo.js";



// Creando una nueva instancia de Router.
const router = Router();





// Creando una nueva instancia de CartManager Y ProductManager. En caso de utilizar FILE SYSTEM agregamos la ruta del archivo.

//const cmanager = new CartManager(__dirname +'/files/cart.json');
const cmanager = new CartManager();
const pmanager = new ProductManager();


// Ruta para manejar las solicitudes GET para obtener todos los carritos. (La misma sirve para mongoDB y file system)
router.get('/' , async (req, res) => {
    
    const carts = await cmanager.getCarts(); // Llamamos al método getCarts de la instancia de CartManager para obtener los carritos y los guardamos en la variable carts
    res.send({status:'sucess' , carts });  // Enviando una respuesta con los carritos obtenidos.

})

// Ruta para manejar las solicitudes POST para agregar un nuevo carrito. (La misma sirve para mongoDB y file system)
router.post('/', async (req, res) => {

    const newCart = req.body; // Obteniendo los datos del carrito desde el cuerpo de la solicitud y los guardamos en la variable newCart. 
    const addcart = await cmanager.addCart(newCart); // Llamando al método addCart de la instancia de CartManager para agregar un carrito y lo guaramos en una variable.
    res.send({status:'Add cart sucess'}); // Enviando una respuesta indicando el éxito al agregar el carrito.
})


// Ruta para manejar las solicitudes GET para recuperar un carrito específico por su ID. (La misma sirve para mongoDB y file system)
router.get('/:cid' , async (req, res) => {

    const cart = req.params.cid; // Obteniendo el ID del carrito desde el parámetro (params) de la URL.
    const getCart = await cmanager.getCartById(+cart); // Llamando al método getCartById de la instancia de CartManager. Agregamos un + en (+cart) para convertirlo en entero y que no se pase un string como parametro. 
    const getProductsCart = getCart.products; // Obteniendo los productos del carrito recuperado.
    res.send({status:'get products susess' , getProductsCart }); // Enviando una respuesta con los productos recuperados.

})


// Ruta para manejar las solicitudes POST para agregar un producto a un carrito específico. (La misma sirve para mongoDB y file system)
router.post('/:cid/product/:pid' , async (req, res) => {

    const cart = req.params.cid; // Obteniendo el ID del carrito desde el parámetro de la URL.
    const product = req.params.pid; // Obteniendo el ID del producto desde el parámetro de la URL.

    const addProductToCart = await cmanager.addProductToCart(cart, product); // Llamando al método addProductToCart de la instancia de CartManager.

    res.send({status:'susess: producto agregado al carrito correctamente'}); // Enviando una respuesta indicando el éxito al agregar el producto al carrito.

})

//ruta para eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
	const { cid, pid } = req.params;
	try {
		//Busca el carrito
		const getCartByID = await cmanager.getCartById(cid)
		if (!getCartByID) {
			return res.status(404).send({ error: 'Cart not found' });
		}
		//Busca el producto en el carrito
		const exist = getCartByID.products.find((prod) => prod.productID == pid);
		if (!exist) {
			return res.status(404).send({ error: 'Not found prod in cart' });
		}

		await cmanager.deleteProdInCart(cid, pid);

		res.status(200).send({ status: 'success', deletedToCart: exist });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

//Vaciar carrito
router.delete('/:cid', async (req, res) => {
	const { cid } = req.params;
	try {
		const existCart = await cmanager.getCartById(cid)

		if (!existCart) {
			return res
				.status(404)
				.send({ Status: 'error', message: 'Cart not found' });
		}

		const emptyCart = await cmanager.deleteAllProductsInCart(cid);

		res.status(200).send({ status: 'success', emptyCart: emptyCart });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

//Agregar array de productos
router.put('/:cid', async (req, res) => {

	const { body } = req;
	const { cid } = req.params;

	try {
		const existCart = cmanager.getCartById(cid);
		if (!existCart) {
			return res
				.status(404)
				.send({ Status: 'error', message: 'Cart not found' });
		}
		body.forEach(async (item) => {
			const existProd = await pmanager.getProductById(item.productID);
			if (!existProd) {
				return res
					.status(404)
					.send({ Status: 'error', message: `Prod ${item.idx} not found` });
			}
		});

		const newCart = await cmanager.insertArrayProds(cid, body);
		res.status(200).send({ status: 'success', newCart: newCart });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
});

//Modificar cantidad
router.put('/:cid/products/:pid', async (req, res) => {
	const { cid, pid } = req.params;
	const { quantity } = req.body;
	try {
		//Busca el carrito
		const getCartByID = await cmanager.getCartById(cid);
		if (!getCartByID) {
			return res.status(404).send({ error: 'Cart not found' });
		}

		//Busca el producto en el carrito
		const exist = getCartByID.products.find((prod) => prod.productID.toJSON() === pid);
		if (!exist) {
			return res.status(404).send({ error: 'Not found prod in cart' });
		}

		const modStock = await cmanager.modifyQuantity(cid, pid, +quantity);
		res.status(200).send({ status: 'success', deletedToCart: modStock });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}



});



export default router;


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
