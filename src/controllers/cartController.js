import cartService from "../services/cartService.js";
import productService from "../services/productService.js";


// Controller para obtener todos los carritos
export const getCarts = async (req, res) => {
	try{
		const carts = await cartService.getCarts(); // Llamamos al método getCarts de la instancia de CartManager para obtener los carritos y los guardamos en la variable carts
		res.status(200).send({status:'success' , carts });  // Enviando una respuesta con los carritos obtenidos.
	}catch (error) {
		res.status(400).send({ error: error.message });
	}
}

//Controller para crear un carrito nuevo
export const newCart = async (req, res) => {
	try{
		const newCart = req.body; // Obteniendo los datos del carrito desde el cuerpo de la solicitud y los guardamos en la variable newCart. 
		const addcart = await cartService.addCart(newCart); // Llamando al método addCart de la instancia de CartManager para agregar un carrito y lo guaramos en una variable.
    	res.status(200).send({status:'success'}); // Enviando una respuesta indicando el éxito al agregar el carrito.
	}catch (error) {
		res.status(400).send({ error: error.message });
	}
}

//Obtener un carrito por id
export const getCartById = async (req, res) => {
	try{
		const cartID = req.params.cid; // Obteniendo el ID del carrito desde el parámetro (params) de la URL.
		const getCart = await cartService.getCartById(+cartID); // Llamando al método getCartById de la instancia de CartManager. Agregamos un + en (+cart) para convertirlo en entero y que no se pase un string como parametro.
		if (!getCart) {
			throw new Error(`Carrito con el id ${cartID} no existe`);
		}
		const getProductsCart = getCart.products; // Obteniendo los productos del carrito recuperado.
		res.status(200).send({status:'success' , getProductsCart }); // Enviando una respuesta con los productos recuperados.
	}catch (error) {
		res.status(400).send({ error: error.message });
	}
}

//agregar un producto al carrito
export const addProductToCart = async (req, res) => {
	try {
		const cart = req.params.cid; // Obteniendo el ID del carrito desde el parámetro de la URL.
		const product = req.params.pid; // Obteniendo el ID del producto desde el parámetro de la URL.
		const addProductToCart = await cartService.addProductToCart(cart, product); // Llamando al método addProductToCart de la instancia de CartManager.
		res.status(200).send({status:'success: producto agregado al carrito correctamente'}); // Enviando una respuesta indicando el éxito al agregar el producto al carrito.
	} catch (error) {
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
		res.status(200).send({ status: 'success', deletedToCart: exist });
	} catch (error) {
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
		res.status(200).send({ status: 'success', emptyCart: emptyCart });
	} catch (err) {
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
			return res.status(404).send({ Status: 'error', message: 'Cart not found' });
		}
		body.forEach(async (item) => {
			const existProd = await productService.getProductById(item.productID);
			if (!existProd) {
				return res.status(404).send({ Status: 'error', message: `Prod ${item.idx} not found` });
			}
		});
		const newCart = await cartService.insertArrayProds(cid, body);
		res.status(200).send({ status: 'success', newCart: newCart });
	} catch (err) {
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
			return res.status(404).send({ error: 'Cart not found' });
		}
		//Busca el producto en el carrito
		const exist = getCartByID.products.find((prod) => prod.productID.toJSON() === pid);
		if (!exist) {
			return res.status(404).send({ error: 'Not found prod in cart' });
		}
		const modStock = await cartService.modifyQuantity(cid, pid, +quantity);
		res.status(200).send({ status: 'success', deletedToCart: modStock });
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
}