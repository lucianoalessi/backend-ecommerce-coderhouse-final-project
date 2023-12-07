import cartService from "../services/cartService.js";
import productService from "../services/productService.js";
import { userModel } from "../models/user.js";
import { ticketModel} from '../models/ticket.model.js'
import ProductManager from "../dao/managersMongoDb/ProductManagerMongo.js";
import CartManager from "../dao/managersMongoDb/CartsManagerMongo.js";
import UserManager from "../dao/managersMongoDb/UserManagerMongo.js"

const productManager = new ProductManager()
const cartManager = new CartManager()
const userManager = new UserManager()


//Controller para obtener todos los carritos
export const getCarts = async (req, res) => {
	try{
		const carts = await cartService.getCarts(); // Llamamos al método getCarts de la instancia de CartManager para obtener los carritos y los guardamos en la variable carts
		req.logger.info(`Carritos obtenidos: ${carts.length}`);
		res.status(200).send({status:'success' , payload: carts });  // Enviando una respuesta con los carritos obtenidos.
	}catch (error) {
		req.logger.error(`Error al obtener carritos: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}

//Controller para crear un carrito nuevo
export const newCart = async (req, res) => {
	try{
		const newCart = req.body; // Obteniendo los datos del carrito desde el cuerpo de la solicitud y los guardamos en la variable newCart. 
		const addCart = await cartService.addCart(newCart); // Llamando al método addCart de la instancia de CartManager para agregar un carrito y lo guaramos en una variable.
    	req.logger.info(`Carrito creado: ${addCart._id}`);
		res.status(201).send({status:'success', payload: addCart}); // Enviando una respuesta indicando el éxito al agregar el carrito.
	}catch (error) {
		req.logger.error(`Error al crear carrito: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}

//Obtener un carrito por id
export const getCartById = async (req, res) => {
	try{
		const cartID = req.params.cid; // Obteniendo el ID del carrito desde el parámetro (params) de la URL.
		const getCart = await cartService.getCartById(cartID); // Llamando al método getCartById de la instancia de CartManager. Agregamos un + en (+cart) para convertirlo en entero y que no se pase un string como parametro.
		if (!getCart) {
			throw new Error(`Carrito con el id ${cartID} no existe`);
		}
		const getProductsCart = getCart.products; // Obteniendo los productos del carrito recuperado.
		req.logger.info(`Productos obtenidos del carrito ${cartID}: ${getProductsCart.length}`);
		res.status(200).send({status:'success' , payload:getCart }); // Enviando una respuesta con los productos recuperados.
	}catch (error) {
		req.logger.error(`Error al obtener carrito por ID: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}

//agregar un producto al carrito
export const addProductToCart = async (req, res) => {
	try {
		const cart = req.params.cid; // Obteniendo el ID del carrito desde el parámetro de la URL.
		const productId = req.params.pid; // Obteniendo el ID del producto desde el parámetro de la URL.
		const userId = req.user._id; //obteniendo el ID del usuario;

		const product = await productManager.getProductById(productId)

		if (product.owner == userId && req.user.role == 'premium') {
			req.logger.info(`El usuario premium ${userId} intentó agregar su propio producto ${productId} al carrito ${cart}`);
			res.status(400).send({status:'error: un usuario premium no puede agregar su propio producto al carrito'});
		}else{
			const addProductToCart = await cartService.addProductToCart(cart, productId); // Llamando al método addProductToCart de la instancia de CartManager.
			req.logger.info(`Producto ${productId} agregado al carrito ${cart}`);
			res.status(200).send({status:'success: producto agregado al carrito correctamente'}); // Enviando una respuesta indicando el éxito al agregar el producto al carrito.
		}
	} catch (error) {
		req.logger.error(`Error al agregar producto al carrito: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}

//eliminar un producto en el carrito
export const deleteProdInCart = async (req, res) => {
	const { cid, pid } = req.params;
	try {
		//Busca el carrito
		const getCartByID = await cartService.getCartById(cid)
		if (!getCartByID) {
			return res.status(404).send({ error: 'Cart not found' });
		}
		//Busca el producto en el carrito
		const exist = getCartByID.products.find((prod) => prod.productID == pid);
		if (!exist) {
			return res.status(404).send({ error: 'Not found prod in cart' });
		}
		await cartService.deleteProdInCart(cid, pid);
		req.logger.info(`Producto ${pid} eliminado del carrito ${cid}`);
		res.status(200).send({ status: 'success', deletedToCart: exist });
	} catch (error) {
		req.logger.error(`Error al eliminar producto del carrito: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}

//vaciar el carrito
export const deleteAllProductsInCart = async (req, res) => {
	const { cid } = req.params;
	try {
		const existCart = await cartService.getCartById(cid)
		if (!existCart) {
			return res
				.status(404)
				.send({ Status: 'error', message: 'Cart not found' });
		}
		const emptyCart = await cartService.deleteAllProductsInCart(cid);
		req.logger.info(`Todos los productos eliminados del carrito ${cid}`);
		res.status(200).send({ status: 'success', emptyCart: emptyCart });
	} catch (err) {
		req.logger.error(`Error al eliminar todos los productos del carrito: ${err.message}`);
		res.status(400).send({ error: err.message });
	}
}

//agregar un array de productos al carrito
export const insertArrayProds = async (req, res) => {
	const { body } = req;
	const { cid } = req.params;
	try {
		const existCart = cartService.getCartById(cid);
		if (!existCart) {
			req.logger.warning(`Carrito ${cid} no encontrado.`);
			return res.status(404).send({ Status: 'error', message: 'Cart not found' });
		}
		body.forEach(async (item) => {
			const existProd = await productService.getProductById(item.productID);
			if (!existProd) {
				req.logger.error(`Producto ${item.idx} no encontrado.`);
				return res.status(404).send({ Status: 'error', message: `Prod ${item.idx} not found` });
			}
		});
		const newCart = await cartService.insertArrayProds(cid, body);
		req.logger.info(`Productos agregados al carrito ${cid}.`);
		res.status(200).send({ status: 'success', newCart: newCart });
	} catch (err) {
		req.logger.error(`Error al agregar productos al carrito: ${err.message}`);
		res.status(400).send({ error: err.message });
	}
}

//modificar cantidad de un producto
export const modifyQuantity = async (req, res) => {
	const { cid, pid } = req.params;
	const { quantity } = req.body;
	try {
		//Busca el carrito
		const getCartByID = await cartService.getCartById(cid);
		if (!getCartByID) {
			req.logger.error(`Carrito ${cid} no encontrado.`);
			return res.status(404).send({ error: 'Cart not found' });
		}
		//Busca el producto en el carrito
		const exist = getCartByID.products.find((prod) => prod.productID.toJSON() === pid);
		if (!exist) {
			req.logger.error(`Producto ${pid} no encontrado en el carrito ${cid}.`);
			return res.status(404).send({ error: 'Not found prod in cart' });
		}
		const modStock = await cartService.modifyQuantity(cid, pid, +quantity);
		req.logger.info(`Cantidad modificada para el producto ${pid} en el carrito ${cid}.`);
		res.status(200).send({ status: 'success', deletedToCart: modStock });
	} catch (error) {
		req.logger.error(`Error al modificar la cantidad de un producto: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}

//finalizar proceso de compra:
export const purchase = async (req,res) => {

	let purchaseComplete = []  //array para los productos procesados correctamente.
	let purchaseError = [] //array para los productos que no pudieron procesarse por falta de stock.
	let precioTotal = 0
	const user = req.user._id; 
	const findUser = await userModel.findById(user);
	const cartId = findUser.cart[0]._id  //cart[0] porque es el primer elemento dentro del array.
	const cart = await cartService.getCartById(cartId)
	const productsInCart = cart.products

	try {

		for (let product of productsInCart ) {
			const idproduct = product.productID
			const quantity = product.quantity
			const productInDB = await productService.getProductById(idproduct)
	
			if(quantity > productInDB.stock){  //verificamos que la cantidad comprada no sea mayor a nuestro stock
				purchaseError.push(product);  //agregamos el producto al array de productos que pudieron procesarse para la compra.
				req.logger.warning(`El producto ${product.productID} no tiene suficiente stock.`);
			}
	
			if(quantity <= productInDB.stock){
	
				let productUpdate = productInDB;
				const quantityUpdate = productInDB.stock - quantity;
				productUpdate.stock = quantityUpdate; //actualizamos el stock del producto
				const update = await productService.updateProduct(idproduct, productUpdate) //Actualizamos el stock en nuestra base de datos luego de la compra
				purchaseComplete.push(product); //agreamos el producto al array para proceder con la compra.
				const monto = productInDB.price * quantity
				precioTotal = precioTotal + monto
				req.logger.info(`El producto ${product.productID} se ha procesado correctamente.`);
			}
		}

		//Eliminamos los productos que se procesaron correctamente del carrito, e insertamos el array de productos no procesados:
		const notPurchasedProductsInCart = await cartService.insertArrayProds(cartId,purchaseError);

		// Solo creamos el ticket si hay productos en purchaseComplete
        if (purchaseComplete.length > 0) {
			//definimos los datos que necesitamos para el ticket:
			const ticketData = {
				amount: precioTotal,
				purchaser: req.user.email
			}
			//creamos el ticket en la base de datos:
			const ticket = await ticketModel.create(ticketData);

			//agregamos informacion adicional, los productos que se procesaron correctamente y los que no:
			const purchaseData = {
				ticket: ticket,
				productosProcesados: purchaseComplete,
				productosNoProcesados: purchaseError,
			}
			//lo enviamos:
			req.logger.info('Compra realizada con éxito.');
			res.status(200).send({ status: 'success', payload: purchaseData})
		}else {
            // Si no hay productos en purchaseComplete, devolvemos los productos en purchaseError
			req.logger.warning('No se procesaron productos, por falta de stock.');
            res.status(200).send({ status: 'success', message: 'No se procesaron productos, por falta de stock.', productosNoProcesados: purchaseError});
        }
		
	} catch (error) {
		req.logger.error(`Error en el proceso de compra: ${error.message}`);
		res.status(400).send({ error: error.message });
	}
}