import { Router } from 'express';
import { 
    getProductsQuery, 
    getProductById, 
    addProduct, 
    updateProduct, 
    deleteProduct
} from '../controllers/productController.js';
//Importamod middleware para logger:
import { addLogger } from '../utils/logger.js';
import { passportCall } from '../../utils.js';
import upload from '../middlewares/multerConfig.js'


//Inicializamos la extencion de express: Router
const router = Router()

// Middleware global para el logger
router.use(addLogger);


//RUTAS:

//Ruta para manejar las solicitudes GET para obtener todos los productos y filtrar por query. (Solo sirve para MONGO DB)
router.get('/' , getProductsQuery );

//Ruta para manejar las solicitudes GET para recuperar un producto específico por su ID. (La misma sirve para mongoDB)
router.get('/:pid' , getProductById );

// Ruta para agregar un producto. (Con .post enviamos informacion al servidor. Con .get obtenemos informacion del servidor). (La misma ruta sirve para mongoDB y file system)
router.post('/' , upload.single('product'), passportCall('jwt'), addProduct );

//Ruta para modificar un producto por ID. (Con put modificamos informacion del servidor).(mongoDB)
router.put('/:pid' , upload.single('product'), passportCall('jwt'), updateProduct );

//Ruta para eliminar un producto. (Con delete eliminamos informacion del servidor). (La misma ruta sirve para mongoDB y file system)
router.delete('/:pid', passportCall('jwt'), deleteProduct );

export default router; 

















//con FILE SYSTEM:

//Ahora utilizaremos MONGO DB, asi que comentamos la importacion de FILE SYSTEM:
//import ProductManager from '../ProductManager.js'

//Creamos una nueva instancia de la clase ProductManager.En caso de utilizar FILE SYSTEM agregamos la ruta del archivo.
//const pmanager = new ProductManager(__dirname + '/files/products.json') //NOTA: para poder acceder al archivo y leer el contenido dentro en el servidor tenemos que usar dirname y no ./files/products.json. (hay que eliminar los puntos para que funcione)


// cambiamos app.get por router.get
// router.get('/' , async (req, res) => {

//     //obetenemos el array de objetos de productos y lo guardamos en una variable productos. Como estamos obteniendo info de una base de datos sera asincronica.
//     const products = await pmanager.getProducts()
//     //Agregamos el soporte para recibir por query param el valor ?limit= . Con esta desestructuracion limitamos la informacion que recibiremos por Query param, ya que el usuario podria poner cualquier valor, pero a nosotros solo nos interesa trabajar con el valor limits.
//     const {limit} = req.query  // otra forma de hacer esto es: const limit = req.query.limit

//     //dependiendo el valor de limite que el usuario ingrese, enviaremos esa cantidad de productos. Si no agrega ningun valor mostraremos todos los productos.    
//     if(limit){
//         const productLimit = products.slice(0,limit);
//         res.send({productLimit}) //con res.send respondemos las peticiones del servidor. Se aconseja enviarlas siempre dentro de un objeto.
//     }else{
//         res.send({products})
//     }  
// })

// router.get('/:pid' , async (req, res) => {

//     //obtenemos todos los productos y la guardamos en una variable
//     const products = await pmanager.getProducts()

//     //filtramos el producto ingresado por params y lo guardamos en una variable.
//     const productFilter = products.find(item => item.id == req.params.pid)

//     //si productFilter posee un valor, sera true y devolveremos ese valor.Si es una variable vacia devolvera false. 
//     if(productFilter){
//         res.send(productFilter)
//     }else{
//         res.send('Error: Producto inexistente')
//     }      
// })

//Con put modificamos informacion del servidor.(file system)

// router.put('/:pid' , async (req, res) => {

//     const productID = +req.params.pid //obtenemos el id de producto ingresado el cliente por paramas
//     const update = req.body     //agregamos la informacion que actualizara el cliente en una variable
//     const productUpdate = await pmanager.updateProduct(productID,update); // actualizamos el producto filtrado

//     res.send({status:'Sucess: product updated', productUpdate});
// })







// //Ruta para manejar las solicitudes GET para obtener todos los productos. (Solo sirve para MONGO DB)
// router.get('/' , async (req, res) => {

//     try{

//         let { limit, page, sort, category } = req.query
//         console.log(req.originalUrl);
//         console.log(req.originalUrl.includes('page'));

//         const options = {
//             page: Number(page) || 1, // page ? Number(page) : 1
//             limit: Number(limit) || 10, // limit ? Number(limit) : 1
//             sort: { price: Number(sort) }
//         };

//         if (!(options.sort.price === -1 || options.sort.price === 1)) {
//             delete options.sort
//         }

//         const links = (products) => {
//             let prevLink;
//             let nextLink;
            
//             if (req.originalUrl.includes('page')) {
//                 // Si la URL original contiene el parámetro 'page', entonces:

//                 prevLink = products.hasPrevPage ? req.originalUrl.replace(`page=${products.page}`, `page=${products.prevPage}`) : null;
//                 nextLink = products.hasNextPage ? req.originalUrl.replace(`page=${products.page}`, `page=${products.nextPage}`) : null;
//                 return { prevLink, nextLink };
//             }
//             if (!req.originalUrl.includes('?')) {
//                 // Si la URL original NO contiene el carácter '?', entonces:

//                 prevLink = products.hasPrevPage ? req.originalUrl.concat(`?page=${products.prevPage}`) : null;
//                 nextLink = products.hasNextPage ? req.originalUrl.concat(`?page=${products.nextPage}`) : null;
//                 return { prevLink, nextLink };
//             }
//             // Si la URL original contiene el carácter '?' (otros parámetros), entonces:

//             prevLink = products.hasPrevPage ? req.originalUrl.concat(`&page=${products.prevPage}`) : null;
//             nextLink = products.hasNextPage ? req.originalUrl.concat(`&page=${products.nextPage}`) : null;
//             console.log(prevLink)
//             console.log(nextLink)

//             return { prevLink, nextLink };

//         }
    

//         // Devuelve un array con las categorias disponibles y compara con la query "category"
//         const categories = await pmanager.categories()

//         const result = categories.some(categ => categ === category)
//         if (result) {

//             const products = await pmanager.getProductsQuery({ category }, options);
//             const { prevLink, nextLink } = links(products);
//             const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs } = products
//             return res.status(200).send({ status: 'success', payload: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink });
//         }

//         const products = await pmanager.getProductsQuery({}, options);
//         // console.log(products, 'Product');
//         const { totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, docs } = products
//         const { prevLink, nextLink } = links(products);
//         return res.status(200).send({ status: 'success', payload: docs, totalPages, prevPage, nextPage, hasNextPage, hasPrevPage, prevLink, nextLink });

//     }catch (error) {
//         console.log(error);
//     } 
// })

    


//     //obetenemos el array de objetos de productos y lo guardamos en una variable productos. Como estamos obteniendo info de una base de datos sera asincronica.
    
//     try{
//         const products = await pmanager.getProducts();
//         if(products.length === 0){
//             res.send('No hay productos en la tienda')
//         }

//         //agregamos un limit
//         const limit = parseInt(req.query.limit) //convertimos el valor recibido por query a entero.
//         if(limit){
//             res.send( {Products: products.slice(0,limit)} )   //otra forma: res.send({Products: limit ? products.slice(0,limit) : products})
//         }

//         res.send({result:'success', payload: products}) 


//     }catch(error){
//         console.log('error para obtener productos');
//     }
// });
