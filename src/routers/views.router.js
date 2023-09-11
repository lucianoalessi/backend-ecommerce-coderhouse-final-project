import  {Router}  from "express";
import __dirname from "../../utils.js";
//ya no usaremos file system, usaremos mongoDB
//import ProductManager from "../ProductManager.js";
import ProductManager from "../dao/managersMongoDb/ProductManagerMongo.js";


const router = Router();


// Creación de una instancia de ProductManager con la ruta al archivo JSON de productos en caso de utilizar File System.
//const pmanager = new ProductManager(__dirname +'/files/products.json')
const pmanager = new ProductManager() //instancia utilizando mongoDB


//ruta para plantilla handlebars
router.get('/', async (req,res)=>{

    const listaProductos = await pmanager.getProducts()
    res.render('home' , {listaProductos, style:'style.css'})
})


//ruta para handlebars + websockets (productos en tiempo real)
router.get('/realtimeproducts' , async (req,res) => {
    const listaProductos = await pmanager.getProducts({})
    res.render('realTimeProducts', {style:'style.css'})

})

//ruta para handlebars + websockets (chat)
router.get("/chat", async (req,res)=>{
    res.render("chat")
})



export default router;