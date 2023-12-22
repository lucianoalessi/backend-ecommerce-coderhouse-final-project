import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js'
import ProductManager from './ProductManager.js';

const productManager = new ProductManager()

class CartManager {

    constructor(){
        this.path = path.join(__dirname, './data/carts.json');  //ubicacion donde se guardara la informacion
        this.carts = []; //array de carritos 
        this.productManager = productManager; //almacenamos productManager como una propiedad de la clase
    }

    // #Metodo para obtener los carritos dentro del array
    getAllCarts = async () => {
        //si el archivo existe, lo leera y convertira el contenido de JSON a elementos de JS y devolvera su contenido
        try{
            // Intentamos leer el archivo con fs.promises.readFile
            const carts = await fs.promises.readFile(this.path,"utf-8")
            // Verificamos si carts no es nulo y si no es una cadena vacía después de eliminar los espacios en blanco
            if (carts && carts.trim() !== "") {
                this.carts = JSON.parse(carts); // Agregado para actualizar los carritos en la clase
                return this.carts;
            } else {
                return [];
            }
        //en caso de que se genere un error debido a que no exista el archivo que se intenta leer debido a que todavia no se agrego ningun producto, devolvemos this.carts, el cual seria un array vacio.
        }catch(error){
            console.log('Error al obtener los carritos:', error.message);
            return this.carts
        }
    }

    //#Obtenemos un carrito por numero de ID.
    getCartById = async (idCart) => {
        try {
            //Almacenamos el contenido del archivo creado en una variable, el cual sera un array de objetos. con un for..of recorremos el arreglo hasta encontrar uno con el mismo id que se ingresa como parametro.
            const carts = await this.getAllCarts()
            return carts.find(cart => cart._id === +idCart);
        } catch (error) {
            console.log('Carrito inexistente:',error.message);
            throw error;
        }
    }

    //#Metodo para crear un carrito
    createCart = async () => {
        try {
            // Primero, obtenemos todos los carritos existentes (los que se crearon previamente) y los almacenamos en this.carts 
            this.carts = await this.getAllCarts();

            // Luego, creamos el nuevo carrito y lo agregamos al array
            const carrito = {
                products: []
            }
            //Generamos un numero de id para cada carrito ingresado al array y que el mismo sea consecutivo segun la posicion que ocupa en el array.
            if(this.carts.length === 0){
                carrito._id = 1 
            }else{
                carrito._id = Math.max(...this.carts.map(cart => cart._id)) + 1 // Modificado para generar un ID único
                // this.carts.map(cart => cart._id): Crea un nuevo array que contiene solo los _id de todos los carritos existentes.
                //Math.max(...): Encuentra el _id más grande en ese array (es decir, el _id del último carrito que se creó).
                //+ 1: Suma 1 al _id más grande para generar un nuevo _id único para el nuevo carrito.
            }

            //agregamos el carrito al array de carritos
            this.carts.push(carrito);
            // Finalmente, escribimos el array actualizado en el archivo
            await fs.promises.writeFile(this.path,JSON.stringify(this.carts,null,2)) // el segundo parametro de stringify es opcional asi que le pusimos null para salterarlo y el 3er parametro es el espacio de sangria. al pasarle un 2 estamos indicando que queremos que la cadena JSON tenga un nivel de sangría de 2 espacios.    
            return carrito
        } catch (error) {
            throw error;
        }
    }


    // #Método para agregar un producto a un carrito específico.
    addProductToCart = async (cartId , productId) => {
        try {
            const carts = await this.getAllCarts(); // Obtenemos todos los carritos.
            const filterCart = carts.find(cart => cart._id === +cartId); // Buscamos el carrito con el ID proporcionado.
            
            if (!filterCart) {
                throw new Error('Carrito no encontrado');
            }

            const product = await this.productManager.getProductById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }
    
            const existingProductInCart = filterCart.products.find(item => item.productID === +productId); 
    
            if(existingProductInCart){
                // Si el producto ya existe en el carrito, aumentamos su cantidad.
                existingProductInCart.quantity += 1; 
            }else{
                // Si el producto no existe en el carrito, lo añadimos con cantidad 1.
                filterCart.products.push({productID:+productId, quantity: 1}) 
            }
            // Actualizamos el archivo con la información actualizada de los carritos.
            await fs.promises.writeFile(this.path,JSON.stringify(carts,null,2))
        } catch (error) {
            throw error;
        }
    }

    // #Método para modificar la cantidad de un producto en un carrito específico.
    modifyQuantity = async (cid, pid, quantity) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);

            // Leer el carrito
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));

            // Encontrar el producto y actualizar la cantidad
            const product = cart.products.find(item => item.productID.toString() === pid);
            if (product) {
                product.quantity = quantity;
            }

            // Guardar el carrito actualizado
            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');
            return cart;
        } catch (error) {
            console.log('Error al agregar un producto al carrito:', error.message);
            throw error;
        }
    };

    // #Método para agregar un array de productos en un carrito
    insertArrayOfProducts = async (cid, arrayOfproducts) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));

            // Crear un nuevo array de productos
            const arr = [];
            for (const item of arrayOfproducts) {
                const productPath = path.join(__dirname, 'products', `${item.productID}.json`);
                const product = JSON.parse(await fs.promises.readFile(productPath, 'utf-8'));
                arr.push({
                    productID: product._id,
                    quantity: item.quantity
                });
            }
            // Actualizar el carrito con los nuevos productos
            cart.products = arr;
            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');

            return cart;
        } catch (error) {
            console.log('Error al agregar un array de productos al carrito:', error.message);
            throw error;
        }
    };

    // #Método para eliminar un producto en un carrito específico.
    deleteProdInCart = async (cid, pid) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));

            //con filter filtramos los productos que no coincidan con el id del producto a ilimanar
            cart.products = cart.products.filter(item => item.productID.toString() !== pid);

            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');
        } catch (error) {
            console.log('Error al eliminar un producto del carrito:', error.message);
            throw error;
        }
    };

    // #Método para eliminar todos los productos de un carrito
    deleteAllProductsInCart = async (cid) => {
        try {
            const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
            // Leer el carrito
            const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));
            // Eliminar todos los productos
            cart.products = [];
            // Guardar el carrito actualizado
            await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');
            return cart;
        } catch (error) {
            console.log('Error al eliminar todos los productos:', error.message);
            throw error;
        }
    };
}

export default CartManager;






//-------------TEST-------------------

// const carro = new CartManager('../../../files/cart2.json');

// const agregarCarro = async () => {

//    await carro.createCart()
//    await carro.createCart()
//    await carro.createCart()
//    await carro.createCart()
//    await carro.createCart()
// }

// agregarCarro()

// Crea una nueva instancia de CartManager.
// const cartManager = new CartManager(path.join(__dirname, './data/carts.json'));

// Ahora puedes usar los métodos de la clase CartManager.
// Por ejemplo, para crear un nuevo carrito:

// cartManager.createCart().then(() => console.log('Carrito creado'));
// cartManager.createCart().then(() => console.log('Carrito creado'));
// cartManager.createCart().then(() => console.log('Carrito creado'));
// cartManager.createCart().then(() => console.log('Carrito creado'));
// cartManager.createCart().then(() => console.log('Carrito creado'));
// cartManager.createCart().then(() => console.log('Carrito creado'));




// O para obtener todos los carritos:
// cartManager.getAllCarts().then(carts => console.log(carts));
// cartManager.getCartById(1).then(carts => console.log(carts));
// cartManager.addProductToCart(1 , 2).then(carts => console.log(carts));