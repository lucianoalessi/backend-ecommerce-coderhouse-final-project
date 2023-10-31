import fs from 'fs';
import path from 'path';


//creamos la clase CartManager

class CartManager {

    constructor(path){
        this.path = path;  //ubicacion donde se guardara la informacion
        this.carts = []; //array de carritos 
    }

        //Metodo para obtener los carritos dentro del array
        getCarts = async () => {
            //si el archivo existe, lo leera y convertira el contenido de JSON a elementos de JS y devolvera su contenido
            try{
                const carts = await fs.promises.readFile(this.path,"utf-8")
                const cartsParse = JSON.parse(carts)
                return cartsParse
            //en caso de que se genere un error debido a que no exista el archivo que se intenta leer debido a que todavia no se agrego ningun producto, devolvemos this.carts, el cual seria un array vacio.
            }catch(error){
                console.log('Error al obtener los carritos:', error.message);
                return this.carts
            }
        }
    
        //obtenemos un carrito por numero de ID.
        getCartById = async (idCart) => {
            try {
                //Almacenamos el contenido del archivo creado en una variable, el cual sera un array de objetos. con un for..of recorremos el arreglo hasta encontrar uno con el mismo id que se ingresa como parametro.
                const carts = await this.getCarts()
                for(const cart of carts){
                    if(cart.id === +idCart){
                        return cart;
                    }
                }  
            } catch (error) {
                console.log('Carrito inexistente:',error.message);
                return error;
            }
        }

    //creamos un metodo para agregar un carrito al array de carritos. 
    addCart = async () => {

        //Definimos los datos que tendra el carrito
        const carrito = {
            products: [],
        }

        //Generamos un numero de id para cada carrito ingresado al array y que el mismo sea consecutivo segun la posicion que ocupa en el array.
        if(this.carts.length === 0){
            carrito.id = 1 
        }else{
            carrito.id = this.carts[this.carts.length - 1].id + 1
        }

        //agregamos el carrito al array de carritos
        this.carts.push(carrito);

        // Creamos o sobrescribimos el archivo con la información de los carritos.
        await fs.promises.writeFile(this.path,JSON.stringify(this.carts,null,2)) // el segundo parametro de stringify es opcional asi que le pusimos null para salterarlo y el 3er parametro es el espacio de sangria. al pasarle un 2 estamos indicando que queremos que la cadena JSON tenga un nivel de sangría de 2 espacios.
        
    }




    // Método para agregar un producto a un carrito específico.
    addProductToCart = async (cId , pId) => {

        const carts = await this.getCarts(); // Obtenemos todos los carritos.
        const filterCart = carts.find(cart => cart.id === +cId); // Buscamos el carrito con el ID proporcionado.
        const productIndex = filterCart.products.findIndex(item => item.productID === +pId); // Buscamos el producto en el carrito basado en el ID del producto.

        if(productIndex !== -1){
            filterCart.products[productIndex].quantity += 1; // Si el producto ya existe en el carrito, aumentamos su cantidad.
        }else{
            filterCart.products.push({productID:+pId, quantity: 1}) // Si el producto no existe en el carrito, lo añadimos con cantidad 1.
        }
        // Actualizamos el archivo con la información actualizada de los carritos.
        await fs.promises.writeFile(this.path,JSON.stringify(carts,null,2))
    }
}

//VERIFICAR LOS SIGUIENTES METODOS:

deleteProdInCart = async (cid, pid) => {
    try {
        const cartPath = path.join(__dirname, 'carts', `${cid}.json`);
        const productPath = path.join(__dirname, 'products', `${pid}.json`);

        // Leer el carrito y el producto
        const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));
        const product = JSON.parse(await fs.promises.readFile(productPath, 'utf-8'));

        // Filtrar los productos
        const filter = cart.products.filter((item) => item.productID.toString() !== product.id.toString());

        // Actualizar el carrito
        cart.products = filter;
        await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');

    } catch (error) {
        console.log('Error al eliminar un producto del carrito:', error.message);
        return error;
    }
};


modifyQuantity = async (cid, pid, quantity) => {
    try {
        const cartPath = path.join(__dirname, 'carts', `${cid}.json`);

        // Leer el carrito
        const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));

        // Encontrar el producto y actualizar la cantidad
        const productIndex = cart.products.findIndex((item) => item.productID.toString() === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
        }

        // Guardar el carrito actualizado
        await fs.promises.writeFile(cartPath, JSON.stringify(cart), 'utf-8');

        return cart;
    } catch (error) {
        console.log('Error al agregar un producto al carrito:', error.message);
        return error;
    }
};

// Método para eliminar todos los productos de un carrito
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
        return error;
    }
};

// Método para agregar un array de productos en un carrito
insertArrayProds = async (cid, body) => {
    try {
        const cartPath = path.join(__dirname, 'carts', `${cid}.json`);

        // Leer el carrito
        const cart = JSON.parse(await fs.promises.readFile(cartPath, 'utf-8'));

        // Crear un nuevo array de productos
        const arr = [];
        for (const item of body) {
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
        return error;
    }
};




export default CartManager;


//-------------TEST-------------------

// const carro = new CartManager('../files/cart.json');

// const agregarCarro = async () => {

//    await carro.addCart()
//    await carro.addCart()
//    await carro.addCart()
//    await carro.addCart()
//    await carro.addCart()
//    console.log(await carro.getCarts()) 
//    console.log(await carro.getCartById(3)) 
// }

// agregarCarro()
