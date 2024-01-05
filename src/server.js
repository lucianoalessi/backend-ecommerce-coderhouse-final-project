import express from "express"; // Importando el módulo Express para crear y configurar la aplicación.
import __dirname from "../utils.js"; //importando rutas absolutas para evitar asuntos de ruteo relativo.
import handlebars from 'express-handlebars'; //importando plantillas con handlebars
import { Server } from "socket.io"; //importamos socket io (websockets)
import mongoose, { connect } from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
// Importamos las rutas:
import productsRouter from './routers/products.router.js'; 
import cartsRouter from './routers/carts.router.js';
import sessionRouter from './routers/sessions.router.js';
import mockingRouter from './routers/mocking.router.js'
import mailingRouter from './routers/mailing.router.js'
import loggerRouter from './routers/logger.router.js'
import usersRouter from './routers/users.router.js'
import viewsRouter from './routers/views.router.js';

//importaciones para passport: 
import passport from "passport";
import initializePassport from "./config/passport.config.js";

//Importamos los modelos de datos de producto y mensajes desde archivos separados.En este caso con mongoDB:
//Import productService from "./productService.js"; //CON FILE SYSTEM
import { productService } from "./services/index.js";
import { messageService } from "./services/index.js";
import { userService } from "./services/index.js";

//importamos dotenv:
import config from './config/config.js';

//importamos swagger para la documentacion:
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";


//Creando una instancia de la aplicación Express.
const app = express()

//Iniciando el servidor Express para escuchar en el puerto 8080.
const port = config.PORT || 8080;
const httpServer = app.listen( port , () => {console.log('Server ON in port:', config.PORT)})

//Creamos un servidor Socket viviendo dentro de nuestro servidor principal:
const socketServer = new Server(httpServer);

//configuracion para documentacion con swagger:
const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentacion Market Place',
            description: 'API pensada para aplicacion de un Marketplace'
        }
    },
    apis: [`${__dirname}/src/docs/**/*.yaml`]
}

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api/docs',swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

//Configuraciones o Middlewares:

app.use(express.json()); // Configurando Express para parsear JSON en las solicitudes.
app.use(express.urlencoded({extended:true})); // Configurando Express para parsear datos de formularios en las solicitudes.
app.use(express.Router()); // Creando una instancia de un enrutador Express.

//Conexion a mongo Atlas:
//mongoose.connect(config.MONGO_URL)
mongoose.connect(process.env.MONGO_URL)


//Session para login (configuracion)
app.use(session({
    // Creo una nueva instancia de MongoStore para almacenar las sesiones en MongoDB
    store: MongoStore.create({
        // Especifico la URL de conexión a tu base de datos MongoDB
        mongoUrl: config.MONGO_URL,
        // Establezco un tiempo de vida máximo para las sesiones en segundos (3600 segundos = 1 hora)
        ttl:3600
    }),
    // Establezco una clave secreta para firmar las cookies de sesión (debe ser una cadena segura):
    secret: 'CoderSecret',
    // No vuelvas a guardar la sesión si no ha cambiado desde la última vez que se guardó:
    resave: false,
    // No guardar una sesión si no se ha inicializado (para ahorrar espacio en la base de datos):
    saveUninitialized: false
}))

//Passport:

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

//Middleware para jwt, manejo de token en cookies:

app.use(cookieParser());

//configuramos la carpeta public como estatica:
app.use('/static' , express.static(__dirname +'/src/public'));

//Configuraciones para plantillas handlebars:
app.engine('handlebars' , handlebars.engine());
app.set('views', __dirname + '/src/views');
app.set('view engine', 'handlebars');

//Rutas utilizadas:

app.use('/api/products' , productsRouter); //Usando el router de productos para las rutas que comienzan con '/api/products'.
app.use('/api/carts' , cartsRouter); //Usando el router de carritos para las rutas que comienzan con '/api/carts'.
app.use('/api/sessions', sessionRouter); //ruta para las sessions 
app.use('/mocking' , mockingRouter);//ruta para mock
app.use('/mail', mailingRouter); //ruta para mails
app.use('/loggerTest', loggerRouter ); //ruta para logger
app.use('/api/users' , usersRouter); //ruta para convertir usuarios a premium
app.use('/', viewsRouter); //router handlebars para io con '/'.




// Configurar el evento de conexión de Socket.IO

socketServer.on('connection', async (socket) => {

    console.log("nuevo cliente conectado")

    //websockets para Productos:

    const products = await productService.getProducts()
    socket.emit('productos', products); //enviamos al cliente un array con todos los productos.

    //#ADD PRODUCT:
    //recibimos informacion del cliente, en este caso un nuevo producto y lo agregamos a nuestra base de datos. 
    socket.on('addProduct', async data => {

        // const product = data.product;
        // const userId = data.userId;
        // const userRole = data.userRole

        // //caso que el administrador quiera crear un producto
        // if (!userId && userRole === 'admin') {
        //     await productService.addProduct(product)
        //     const updateProductsList = await productService.getProducts();
        //     socket.emit('updatedProducts', updateProductsList ); //le enviamos al cliente la lista de productos actualizada con el producto que anteriormente agrego. 
        //     socket.emit('productAdded'); //para el manejo de alertas
        //     return;
        // }
        
        // //caso que un usuario cree un producto
        // const user = await userService.getUserById(userId);
        // if(user) product.owner = user._id

        // await productService.addProduct(product)
        // const updateProductsList = await productService.getProducts();
        // socket.emit('updatedProducts', updateProductsList ); //le enviamos al cliente la lista de productos actualizada con el producto que anteriormente agrego. 
        // socket.emit('productAdded'); //para el manejo de alertas

        const updateProductsList = await productService.getProducts();
        socket.emit('updatedProducts', updateProductsList ); //le enviamos al cliente la lista de productos actualizada con el producto que anteriormente agrego. 
        socket.emit('productAdded'); //para el manejo de alertas
    })

    //#UPDATE PRODUCT:
    socket.on('updateProduct', async (productData, userData) => {
        const idProduct = productData._id;
        delete productData._id; // Eliminar el _id del objeto para evitar errores
    
        // Obtener el producto de la base de datos
        const product = await productService.getProductById(idProduct);
    
        // Verificar si el usuario es el propietario del producto o es un administrador
        if (userData.role === 'admin' || product.owner === userData._id) {

            // Actualizar el producto en la base de datos
            await productService.updateProduct(idProduct, { $set: productData });
    
            const updateProductsList = await productService.getProducts();
            socket.emit('updatedProducts', updateProductsList ); //le enviamos al cliente la lista de productos actualizada con el producto que anteriormente agrego. 
            socket.emit('productUpdated');//para el manejor de alertas
        } else {
            // Enviar un mensaje de error al cliente
            socket.emit('error',  'No tienes permiso para actualizar este producto.' );
        }
    });


    //#DELETE PRODUCT:
    //recibimos del cliente el id del producto a eliminar
    socket.on('deleteProduct', async (productId , userData) => {

        const updateProducts = await productService.getProducts(); //obtenemos la lista actualizada con el producto eliminado
        socket.emit('updatedProducts', updateProducts ); //le enviamos al cliente la lista actualizada

        // // Obtenemos el producto
        // const product = await productService.getProductById(productId);

        // if (product === null) {
        //     socket.emit('error', 'Producto no encontrado');
        // }
        // // Verificamos si el usuario es el propietario del producto o si es admin
        // else if (userData.role === 'admin' || product.owner === userData._id) {
        //     await productService.deleteProduct(productId); //eliminamos el producto
        //     const updateProducts = await productService.getProducts(); //obtenemos la lista actualizada con el producto eliminado
        //     socket.emit('updatedProducts', updateProducts ); //le enviamos al cliente la lista actualizada
        //     socket.emit('productDeleted')//para el manejo de alertas
        // } else {
        //     socket.emit('error', 'No tienes permiso para eliminar este producto');
        // }
    })

})





//websockets para el chat:

socketServer.on('connection', async (socket) => {

    console.log("nuevo cliente conectado 2")


    //recibimos el nombre del usuario que se registro:
    socket.on('authenticated', data => {
        console.log(data)
        socket.broadcast.emit('newUserConnected', data);
    })


    //recibimos el usuario con su mensaje
    socket.on('message', async data => {
        console.log(data)
        const addMessage = await messageService.addMessages(data); //agregamos el mensaje del usuario a la base de datos. 
        const messages = await messageService.getMessages(); //obtenemos todos los mensajes de la base de datos.
        socket.emit('messageLogs', messages); //enviamos al cliente la lista de todos los mensajes (array).
    })
});

export default app;
