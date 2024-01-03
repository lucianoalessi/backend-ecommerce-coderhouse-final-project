// Importando servicios necesarios
import { cartService } from "../services/index.js";
import { productService } from "../services/index.js";
import { userService } from "../services/index.js";
import { ticketService } from "../services/index.js";


// Controlador para obtener todos los carritos
export const getAllCarts = async (req, res) => {
	try {
		// Llamamos al método getAllCarts de la instancia de CartManager para obtener los carritos
		const allCarts = await cartService.getAllCarts();
		// Logueamos la cantidad de carritos obtenidos
		req.logger.info(`Numero de carritos obtenidos: ${allCarts.length}`);
		// Enviando una respuesta con los carritos obtenidos
		res.status(200).json({ status: 'success', payload: allCarts });
	} catch (error) {
		// Logueamos el error
		req.logger.error(`Error al obtener carritos: ${error.message}`);
		// Enviando una respuesta con el error
		res.status(400).json({ error: error.message });
	}
};

// Controlador para crear un carrito nuevo
export const createNewCart = async (req, res) => {
	try {
		// Obteniendo los datos del carrito desde el cuerpo de la solicitud
		const cartData = req.body;
		// Llamando al método createCart de la instancia de CartManager para agregar un carrito
		const createdCart = await cartService.createCart(cartData);
		// Logueamos el ID del carrito creado
		req.logger.info(`ID del Carrito creado: ${createdCart._id}`);
		// Enviando una respuesta indicando el éxito al agregar el carrito
		res.status(201).json({ status: 'success', payload: createdCart });
	} catch (error) {
		// Logueamos el error
		req.logger.error(`Error al crear un nuevo carrito: ${error.message}`);
		// Enviando una respuesta con el error
		res.status(400).json({ error: error.message });
	}
};

// Controlador para obtener un carrito por id
export const getCartById = async (req, res) => {
	try {
		// Obteniendo el ID del carrito desde el parámetro (params) de la URL
		const cartID = req.params.cid;
		// Llamando al método getCartById de la instancia de CartManager
		const getCart = await cartService.getCartById(cartID);
		// Si el carrito no existe, lanzamos un error
		if (!getCart) {
			throw new Error(`Carrito con el id ${cartID} no existe`);
		}
		// Obteniendo los productos del carrito recuperado
		const getProductsCart = getCart.products;
		// Logueamos la cantidad de productos obtenidos del carrito
		req.logger.info(`Productos obtenidos del carrito ${cartID}: ${getProductsCart.length}`);
		// Enviando una respuesta con los productos recuperados
		res.status(200).json({ status: 'success', payload: getCart });
	} catch (error) {
		// Logueamos el error
		req.logger.error(`Error al obtener carrito por ID: ${error.message}`);
		// Enviando una respuesta con el error
		res.status(400).json({ error: error.message });
	}
};

//Agregar un producto al carrito
export const addProductToCart = async (req, res) => {
	try {
		// Obteniendo el ID del carrito y del producto desde los parámetros de la URL.
		const cartId = req.params.cid; 
		const productId = req.params.pid;
		//obteniendo el ID del usuario;
		const userId = req.user._id; 

		// Obteniendo el producto por su ID
		const product = await productService.getProductById(productId)

		// Verificando si el usuario es premium y es el dueño del producto
		if (product.owner == userId && req.user.role == 'premium') {
			req.logger.info(`El usuario premium ${userId} intentó agregar su propio producto ${productId} al carrito ${cartId}`);
			res.status(400).json({status:'error: un usuario premium no puede agregar su propio producto al carrito'});
		}else{
			// Agregando el producto al carrito
			const addProductToCart = await cartService.addProductToCart(cartId, productId);
			req.logger.info(`Producto ${productId} agregado al carrito ${cartId}`);
			// Enviando una respuesta indicando el éxito al agregar el producto al carrito.
			res.status(200).json({status:'success: producto agregado al carrito correctamente'}); 
		}
	} catch (error) {
		req.logger.error(`Error al agregar producto al carrito: ${error.message}`);
		res.status(400).json({ error: error.message });
	}
}

// Controlador para eliminar un producto en el carrito
export const deleteProdInCart = async (req, res) => {
	const { cid: cartId, pid: productId } = req.params;

	try {
		// Busca el carrito
		const cart = await cartService.getCartById(cartId);

		if (!cart) {
			req.logger.error('Carrito no encontrado');
			return res.status(404).json({ error: 'Carrito no encontrado' });
		}

		// Busca el producto en el carrito
		const productExists = cart.products.find((product) => product.productID == productId);

		if (!productExists) {
			req.logger.error('Producto no encontrado en el carrito');
			return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
		}

		await cartService.deleteProdInCart(cartId, productId);
		req.logger.info(`Producto ${productId} eliminado del carrito ${cartId}`);
		res.status(200).json({ status: 'success', payload: productExists });
	} catch (error) {
		req.logger.error(`Error al eliminar producto del carrito: ${error.message}`);
		res.status(400).json({ error: error.message });
	}
};

// Vaciar el carrito
export const deleteAllProductsInCart = async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartService.getCartById(cid);

        if (!cart) {
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
            return;
        }

        await cartService.deleteAllProductsInCart(cid);

        req.logger.info(`Todos los productos han sido eliminados del carrito ${cid}`);
        res.status(200).json({ status: 'success', message: 'Carrito vaciado con éxito' });
    } catch (err) {
        req.logger.error(`Error al eliminar todos los productos del carrito: ${err.message}`);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
}

// Agregar un array de productos al carrito
export const addProductsToCart = async (req, res) => {
    const { body: productsToAdd } = req;
    const { cid: cartId } = req.params;

    try {
        const existingCart = await cartService.getCartById(cartId);

        if (!existingCart) {
            req.logger.warning(`Carrito ${cartId} no encontrado.`);
            res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
            return;
        }

        for (const product of productsToAdd) {
            const existingProduct = await productService.getProductById(product.productID);

            if (!existingProduct) {
                req.logger.error(`Producto ${product._id} no encontrado.`);
                res.status(404).json({ status: 'error', message: `Producto ${product._id} no encontrado` });
                return;
            }
        }

        const updatedCart = await cartService.insertArrayOfProducts(cartId, productsToAdd);

        req.logger.info(`Productos agregados al carrito ${cartId}.`);
        res.status(200).json({ status: 'success', message: 'Productos agregados con éxito', updatedCart });
    } catch (err) {
        req.logger.error(`Error al agregar productos al carrito: ${err.message}`);
        res.status(500).json({ status: 'error', message: 'Error del servidor' });
    }
}

// Función para modificar la cantidad de un producto en el carrito
export const modifyProductQuantity = async (req, res) => {

	const { cid, pid } = req.params;
	const { newQuantity } = req.body;
	
	try {
		// Buscar el carrito por ID
		const foundCart = await cartService.getCartById(cid);
		console.log('hola')
		console.log(foundCart)
		// Si el carrito no se encuentra, lanzar un error
		if (!foundCart) {
			throw new Error(`Carrito ${cid} no encontrado.`);
		}

		// Buscar el producto en el carrito
		const productInCart = foundCart.products.find((product) => product.productID.toString() === pid);
		// Si el producto no se encuentra en el carrito, lanzar un error
		if (!productInCart) {
			throw new Error(`Producto ${pid} no encontrado en el carrito ${cid}.`);
		}

		// Modificar la cantidad del producto en el carrito
		const updatedCart = await cartService.modifyQuantity(cid, pid, Number(newQuantity));
		// Registrar el éxito de la operación
		//request.logger.info(`Cantidad modificada para el producto ${productId} en el carrito ${cartId}.`);
		// Enviar una respuesta de éxito con el carrito actualizado
		return res.status(200).json({ status: 'success', updatedCart });
	} catch (error) {
		// Registrar el error
		//request.logger.error(`Error al modificar la cantidad de un producto: ${error.message}`);
		// Enviar una respuesta de error con el mensaje de error
		return res.status(500).json({ error: error.message });
	}
};

//finalizar proceso de compra:
export const purchase = async (req,res) => {

	req.logger.info('Iniciando el proceso de compra');
	let purchaseComplete = []  //array para los productos procesados correctamente.
	let purchaseError = [] //array para los productos que no pudieron procesarse por falta de stock.
	let precioTotal = 0
	const userId = req.user._id; 
	const findUser = await userService.getUserById(userId);
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
		const notPurchasedProductsInCart = await cartService.insertArrayOfProducts(cartId,purchaseError);

		// Solo creamos el ticket si hay productos en purchaseComplete
        if (purchaseComplete.length > 0) {
			//definimos los datos que necesitamos para el ticket:
			const ticketData = {
				amount: precioTotal,
				purchaser: req.user.email
			}
			//creamos el ticket en la base de datos:
			const ticket = await ticketService.addTicket(ticketData);
			req.logger.info(`Ticket de compra creado con éxito. ID del ticket: ${ticket._id} , Monto total:${precioTotal} , Usuario: ${req.user.email}`);

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