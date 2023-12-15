// Importamos los modelos de datos de carrito y producto desde archivos separados.
import { cartModel } from '../../models/carts.model.js'
import { productModel } from '../../models/product.model.js';

// Definimos una clase llamada CartManager para gestionar operaciones relacionadas con los carritos.
export default class CartManager{

    constructor(){
        // Constructor vacío por ahora.
    }

    // Método para obtener todos los carritos en la base de datos.
    getAllCarts = async () => {
        try{
            const carts = await cartModel.find();
            return carts;
        }catch(error){
            console.error('Error al obtener los carritos:', error.message);
            return error
        }
    }

    // Método para obtener un carrito específico por su ID.
    getCartById = async (idCart) => {
        try{
            const cart = await cartModel.findById(idCart).lean();
            return cart;
        }catch(error){
            console.error('Carrito inexistente:',error.message);
            return error;
        }
    }

    // Método para crear un nuevo carrito. Los productos son opcionales.
    createCart = async (products) => {
        try{
            // Inicializamos los datos del carrito.
            let cartData = {};

            // Si se proporcionan productos y no están vacíos, los agregamos al carrito.
            if (products && products.length > 0) {
                cartData.products = products;
            }

            // Creamos el carrito en la base de datos y lo retornamos.
            const newCart = await cartModel.create(cartData);
            console.log('Carrito creado con éxito:', newCart);
            return newCart;
        }catch(error){
            console.error('Error al crear el carrito:', error.message);
            return error;
        }
    }

    // Agrega un producto a un carrito existente por sus IDs.
    addProductToCart = async (cid, pid) => {
        try{
            const cart = await cartModel.findOne({_id: cid});
            const addProduct = await productModel.findOne({_id: pid});
            const productIndex = cart.products.findIndex(item => item.productID.toString() == addProduct._id.toString()); // Buscamos el producto en el carrito basado en el ID del producto.
            
            if(productIndex !== -1){
                cart.products[productIndex].quantity += 1; // Si el producto ya existe en el carrito, aumentamos su cantidad.
            }else{
                cart.products.push({productID: pid}) // Si el producto no existe en el carrito, lo añadimos con cantidad 1.
            }

            await cartModel.updateOne({_id: cid}, cart);
            return cart

        }catch(error){
            console.log('Error al agregar el producto al carrito:' ,error.message);
            return error;
        }
    }

    //metodo para agregar un producto a un carrito y especificar la cantidad por body. 
    modifyQuantity = async (cid, pid, quantity) => {
		try {
			// Filtrar por el índice del carrito y el índice del producto
			const filter = { _id: cid, 'products.productID': pid };
			// Actualizar la cantidad del producto específico
			const update = { $set: { 'products.$.quantity': quantity } };
			const updatedCart = await cartModel.findOneAndUpdate(filter, update, {new: true}); // new: true devuelve el documento actualizado
			return updatedCart;
		} catch (error) {
			console.log('Error al agregar un producto al carrito:', error.message);
            return error;
		}
	};

    //metodo para agregar un array de productos en un carrito
	insertArrayProds = async (cid, body) => {
		try {
			//A partir de los datos, buscar por idx los productos para obtener su _id para generar el populate
			const arr = [];
			for (const item of body) {
				const object = await productModel.findById(item.productID);
				arr.push({
					productID: object._id,
					quantity: item.quantity
				});
			}
			// Filtrar por el índice del carrito
			const filter = { _id: cid };
			// Actualizar con los nuevos datos
			const update = { $set: { products: arr } };

			const updateCart = await cartModel.findOneAndUpdate(filter, update, {
				new: true,
			});
			return updateCart;
		} catch (error) {
			console.log(error.message);
		}
	};

    //eliminar un producto en el carrito
    deleteProdInCart = async (cid, pid) => {
		try {
			const cart = await cartModel.findOne({ _id: cid });
            const product = await productModel.findOne({_id: pid})
			const filter = cart.products.filter((item) => item.productID.toString() !== product._id.toString());
			await cartModel.updateOne({ _id: cid }, { products: filter });
		} catch (error) {
			console.log('Error al eleminar un producto del carrito:', error.message);
            return error;
		}
	};

    //metodo para eliminar todos los productos de un carrito
	deleteAllProductsInCart = async (cid) => {
		try {
			// Filtrar por el índice del carrito
			const filter = { _id: cid };
			// Actualizar la cantidad del producto específico
			const update = { $set: { products: [] } };
			const updateCart = await cartModel.findOneAndUpdate(filter, update, {new: true});
			return updateCart;
		} catch (error) {
			console.log('Error al eliminar todos los productos:', error.message);
		}
	};

}