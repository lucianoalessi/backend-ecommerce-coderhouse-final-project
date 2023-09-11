import { Router } from 'express';
import __dirname from '../../utils.js'

//Ahora utilizaremos MONGO DB, asi que comentamos la importacion de FILE SYSTEM:

//import ProductManager from '../ProductManager.js'
import ProductManager from '../dao/managersMongoDb/ProductManagerMongo.js';


//Inicializamos la extencion de express, Router
const router = Router()




//Creamos una nueva instancia de la clase ProductManager.En caso de utilizar FILE SYSTEM agregamos la ruta del archivo.

//const pmanager = new ProductManager(__dirname + '/files/products.json') //NOTA: para poder acceder al archivo y leer el contenido dentro en el servidor tenemos que usar dirname y no ./files/products.json. (hay que eliminar los puntos para que funcione)
const pmanager = new ProductManager()





//Ruta para manejar las solicitudes GET para obtener todos los productos. (Solo sirve para MONGO DB)
router.get('/' , async (req, res) => {

    //obetenemos el array de objetos de productos y lo guardamos en una variable productos. Como estamos obteniendo info de una base de datos sera asincronica.
    
    try{
        const products = await pmanager.getProducts();
        if(products.length === 0){
            res.send('No hay productos en la tienda')
        }

        //agregamos un limit
        const limit = parseInt(req.query.limit) //convertimos el valor recibido por query a entero.
        if(limit){
            res.send( {Products: products.slice(0,limit)} )   //otra forma: res.send({Products: limit ? products.slice(0,limit) : products})
        }

        //agregamos un page
        const page = parseInt(req.query.page) //convertimos el valor recibido por query a entero.
        if(page){
            res.send( {Products: products.slice(0,page)} )   
        }

        //agregamos un sort

        const sort = parseInt(req.query.sort) //convertimos el valor recibido por query a entero.
        if(sort){
            res.send( {Products: products.slice(0,sort)} )  
        }

        res.send({result:'success', payload: products}) 
    }catch(error){
        console.log('error para obtener productos');
    }
});


//Ruta para manejar las solicitudes GET para recuperar un producto específico por su ID. (La misma sirve para mongoDB)
router.get('/:pid' , async (req, res) => {
    try{
        //obtenemos el producto por ID
        let {pid} = req.params
        const product = await pmanager.getProductById(pid)
        res.send({status:'sucess', product});
    }catch(error){
        console.error('Producto inexistente', error.message);
        return error;
    }
});


// Con .post enviamos informacion al servidor. Con .get obtenemos informacion del servidor. (La misma ruta sirve para mongoDB y file system)
router.post('/' , async (req, res) => {

    const newProduct = req.body                             // la informacion que enviara el cliente estara dentro del req.body.
    const addProduct = await pmanager.addProduct(newProduct) //agregamos el producto enviado por el cliente.
    res.send({status:"Sucess: Producto agregado"})          //devolvemos un estado si se agrego correctamente.
})


//Con put modificamos informacion del servidor.(mongoDB)
router.put('/:pid' , async (req, res) => {

    const productID = req.params.pid //obtenemos el id de producto ingresado el cliente por paramas
    const update = req.body     //agregamos la informacion que actualizara el cliente en una variable
    const productUpdate = await pmanager.updateProduct(productID,update); // actualizamos el producto filtrado

    res.send({status:'Sucess: product updated', productUpdate});
})

//Con delete eliminamos informacion del servidor. (La misma ruta sirve para mongoDB y file system)
router.delete('/:pid', async (req, res) => {
    let {pid} = req.params                                 //obtenemos el id de producto ingresado el cliente por paramas
    const productDeleted = await pmanager.deleteProduct(pid);  //eliminamos el producto deseado

    res.send({status:'Sucess: Producto eliminado'});                //devolvemos un estado si se elimino exitosamente
})


export default router; 















//con FILE SYSTEM:

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