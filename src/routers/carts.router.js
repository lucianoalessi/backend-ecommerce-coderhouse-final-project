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

export default router;