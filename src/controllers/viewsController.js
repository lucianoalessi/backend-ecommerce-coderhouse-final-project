import { cartService } from "../services/index.js";
import { productService } from "../services/index.js";
import { userService } from "../services/index.js";
import { ticketService } from "../services/index.js";


//Controllers para las vistas:

// Vista de productos home
export const getProducts = async (req, res) => {
    const { limit, page, sort, category } = req.query;
    try {
        const products = await productService.getProductsQuery(limit, page, sort, category);
        res.render('home', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

// Vista de productos con su paginacion (pagination):
export const pagination = async (req, res) => {
    const { limit, page, sort, category } = req.query;
    const user = req.user;
    const userPremiumOrAdmin = user.role === 'premium' || user.role === 'admin'
    const userObject = await userService.getUserById(user._id);
    const cart = userObject.cart[0]._id;
    
    try {
        const products = await productService.getProductsQuery(limit, page, sort, category);
        res.render('products', { products, user, userPremiumOrAdmin, cart });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

// Vista de productos en tiempo real con formulario para agregar mas productos. (ruta para handlebars + websockets):
export const getProductsInRealTime = async (req, res) => {
    try {
        const listaProductos = await productService.getProducts({});
        const user = req.user;
        const userAdmin = user.role === 'admin'
        const userObject = await userService.getUserById(user._id);
        //const cart = userObject.cart[0]._id;
        res.render('realTimeProducts', { listaProductos, user, userAdmin, style: 'style.css' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

//Vista del carrito:
export const cartView =  async (req, res) => {
	//const { cid } = req.params;
	//const carrito = await cartService.getCartById(cid); //ACA nos devuelve un objeto de MONGO, por lo cual hay que convertirlo a un objeto plano de JS con toOBJECT
	//const carritoToObj = carrito.toObject() //convertimos el objeto que devuelve mongo en su formato a un objeto plano de javaScript. la alternativa de esto es agregar .lean() en mongo
    try {
        const userId = req.user._id;
        const user = await userService.getUserById(userId);
        const cartId = user.cart[0]._id;
        const cart = await cartService.getCartById(cartId);
  
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        const productsInCart = cart.products

        const cartDetail = []
        let totalPrice = 0;

        for (let product of productsInCart ) {
            let productDetail = await productService.getProductById(product.productID);
            productDetail = productDetail.toObject(); // Convertir a objeto plano
            productDetail.quantity = product.quantity
            cartDetail.push(productDetail)
            totalPrice += productDetail.price * productDetail.quantity
        }

        res.render("cart", { cart, cartDetail, totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

// Vista para purchase:
export const purchaseView = async (req, res) => {

    let purchaseComplete = []  //array para los productos procesados correctamente.
    let purchaseError = [] //array para los productos que no pudieron procesarse por falta de stock.
    let precioTotal = 0
    const userId = req.user._id; 

    try {
        const findUser = await userService.getUserById(userId);
        if (!findUser) {
            throw new Error('Usuario no encontrado');
        }

        const cartId = findUser.cart[0]._id  //cart[0] porque es el primer elemento dentro del array.
        const cart = await cartService.getCartById(cartId)
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        const productsInCart = cart.products

        for (let product of productsInCart ) {
            const idproduct = product.productID
            const quantity = product.quantity
            const productInDB = await productService.getProductById(idproduct)
    
            if(quantity > productInDB.stock){  //verificamos que la cantidad comprada no sea mayor a nuestro stock
                purchaseError.push(product);  //agregamos el producto al array de productos que pudieron procesarse para la compra.

            }
    
            if(quantity <= productInDB.stock){
                let productUpdate = productInDB;
                const quantityUpdate = productInDB.stock - quantity;
                productUpdate.stock = quantityUpdate; //actualizamos el stock del producto
                const update = await productService.updateProduct(idproduct, productUpdate) //Actualizamos el stock en nuestra base de datos luego de la compra
                purchaseComplete.push(product); //agreamos el producto al array para proceder con la compra.
                const monto = productInDB.price * quantity
                precioTotal = precioTotal + monto

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

            //MODIFICACIONES PARA QUE RENDERIZE LA VISTA:
            //agregamos informacion adicional, los productos que se procesaron correctamente y los que no:
            const purchaseData = {
                ticketId: ticket._id,
                amount: ticket.amount,
                purchase_datetime: ticket.purchase_datetime,
                purchaser:ticket.purchaser,
                productosProcesados: purchaseComplete,
                productosNoProcesados: purchaseError,
            }
            // Renderizamos la vista 'purchase' con los datos de la compra:
            res.status(200).render('purchase', { status: 'success', payload: purchaseData , cartId});
        } else {
            // Si no hay productos en purchaseComplete, renderizamos la vista 'error' con los productos en purchaseError
            res.status(200).send('errorPurchase', { status: 'success', message: 'No se procesaron productos, por falta de stock.', productosNoProcesados: purchaseError });
        }
        
    } catch (error) {

        res.status(400).send({ error: error.message });
    }
}

// Vista para el chat (handlebars + websockets):
export const chatStyle = async (req, res) => {
    res.render("chat", { style: 'style.css' });
}


// Rutas de vistas para Sessions:

// Redirect to '/':
export const redirection = async (req, res) => {
    try {
        res.status(200).redirect('/home');
    } catch (err) {
        console.error(err);
        res.status(400).send({ error: err.message });
    }
}

// Vista para logearse:
export const loginView = (req, res) => {
    res.render('login');
}

// Vista para registrarse:
export const registerView = (req, res) => {
    res.render('register');
}

// Vista para restablecer password:
export const resetPasswordView = (req, res) => {
    res.render('resetPassword', { style: 'style.css' });
}

// Vista para ingresar nuevo password:
export const newPasswordView = (req, res) => {
    res.render('newPassword');
}

// Vista para el perfil del usuario:
export const profileView = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userService.getUserById(userId);
        const cartId = user.cart[0]._id;
        res.render('profile', { user, cartId });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
}

// Vista para cargar documentos:
export const uploadDocumentView = async (req, res) => {
    const userId = req.user._id
    res.render('multer' , {userId});
}

//vista para administrar usuarios por el administrador:
export const usersAdminManager = async (req, res) => {
    const users = await userService.getUsers()
    res.render('admin' , {users});
}