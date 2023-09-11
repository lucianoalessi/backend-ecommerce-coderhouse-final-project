import fs from 'fs';


//creamos la clase CartManager

class CartManager {

    constructor(path){
        this.path = path;  //ubicacion donde se guardara la informacion
        this.carts = []; //array de carritos 
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

    //metodo para obtener los carritos dentro del array
    getCarts = async () => {
        
        //si el archivo existe, lo leera y convertira el contenido de JSON a elementos de JS y devolvera su contenido
        try{
            const carts = await fs.promises.readFile(this.path,"utf-8")
            const cartsParse = JSON.parse(carts)
            return cartsParse

        //en caso de que se genere un error debido a que no exista el archivo que se intenta leer debido a que todavia no se agrego ningun producto, devolvemos this.carts, el cual seria un array vacio.
        }catch{
            return this.carts
        }
    }

    //obtenemos un carrito por numero de ID.
    getCartById = async (searchId) => {

        //Almacenamos el contenido del archivo creado en una variable, el cual sera un array de objetos. con un for..of recorremos el arreglo hasta encontrar uno con el mismo id que se ingresa como parametro.
        const carts = await this.getCarts()
        for(const cart of carts){
            if(cart.id === +searchId){
                return cart;
            }
        }
        return 'Not found'
    }


    // Método para agregar un producto a un carrito específico.
    addProductToCart = async (cId , pId) => {

        const carts = await this.getCarts(); // Obtenemos todos los carritos.
        const filterCart = carts.find(cart => cart.id === +cId); // Buscamos el carrito con el ID proporcionado.
        const productIndex = filterCart.products.findIndex(item => item.id === +pId); // Buscamos el producto en el carrito basado en el ID del producto.

        if(productIndex !== -1){
            filterCart.products[productIndex].quantity += 1; // Si el producto ya existe en el carrito, aumentamos su cantidad.
        }else{
            filterCart.products.push({id:+pId, quantity: 1}) // Si el producto no existe en el carrito, lo añadimos con cantidad 1.
        }

        // Actualizamos el archivo con la información actualizada de los carritos.
        await fs.promises.writeFile(this.path,JSON.stringify(carts,null,2))

    }

}


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
