// Importamos los modelos de datos de carrito y producto desde archivos separados.
import { cartModel } from '../models/carts.model.js'
import { productModel } from '../models/product.model.js';

// Definimos una clase llamada CartManager para gestionar operaciones relacionadas con los carritos.
export default class CartManager{

    constructor(){
        // Constructor vacío por ahora.
    }

    // Método para obtener todos los carritos en la base de datos.
    getCarts = async () => {
        try{
            const carts = await cartModel.find();
            return carts;
        }catch(error){
            console.error('Error al obtener los carritos',error.message);
            return []
        }
    }

    // Método para obtener un carrito específico por su ID.
    getCartById = async (idCart) => {
        try{
            const cart = await cartModel.findOne({_id: idCart});
            return cart;
        }catch(error){
            console.error('Carrito inexistente:',error.message);
            return error;
        }
    }

    // Método para crear un nuevo carrito con productos proporcionados (opcional).
    addCart = async (products) => {
        try{

            let cartData = {};
            if (products && products.length > 0) {
                cartData.products = products;
            }
    
            return await cartModel.create(cartData);
        
        }catch(error){
            console.error('Error al crear el carrito', error.message);
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

        }catch(error){
            console.error('Error al agregar el producto al carrito:' ,error.message);
            return error;
        }
    }


    deleteProductInCart = async (idCart, products) => {

        try {
            return await cartModel.findOneAndUpdate(
                { _id: cid },
                { products },
                { new: true })

        } catch (error) {
            return error
        }
    }

    updateOneProduct = async (cid, products) => {
        
        await cartModel.updateOne(
            { _id: cid },
            {products})
        return await cartModel.findOne({ _id: cid })
    }


}