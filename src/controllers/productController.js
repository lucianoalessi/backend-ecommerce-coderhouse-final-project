import productService from "../services/productService.js";
//manejo de errores custom:
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateProductErrorInfo } from "../services/errors/info.js";
//importamos el logger:
import {addLogger} from '../utils/logger.js'; 

//Controller para obtener los productos y filtrar por query
export const getProductsQuery = async (req, res) => {
    const { limit, page, sort, query } = req.query;
	try {
		const prods = await productService.getProductsQuery(
			limit,
			page,
			sort,
			query
		);
        req.logger.info(`Productos obtenidos: ${prods.length}`); //logger de informacion
		res.status(200).send({ status: 'success', prods: prods });
	} catch (err) {
        req.logger.error(`Error al obtener productos: ${err.message}`); //logger de error
		res.status(400).send({ error: err.message });
	}
}

//obtener productos por id
export const getProductById = async (req, res) => {
    try{
        //obtenemos el producto por ID
        const {pid} = req.params
        //Verificamos que sea un id de mongo valido
        if (pid.length !== 24) {
            throw new Error('El ID del producto no es válido');
        }
        
        const product = await productService.getProductById(pid)

        if (!product) {
            throw new Error('Producto no encontrado');
        }

        req.logger.info(`Producto obtenido: ${product.title}`);
        res.status(200).send({status:'success', payload:product});
    }catch(error){
        req.logger.error(`Error: ${error.message}`);
        res.status(400).send({status: 'error', message: error.message});
    }
}

//agregar un producto nuevo
export const addProduct = async (req, res) => {
    try {
        //const newProduct = req.body   // la informacion que enviara el cliente estara dentro del req.body.
        const {title, description, price, thumbnail, code, stock, category} = req.body
        if(!title || !description || !price || isNaN(price) || !code  || !stock || isNaN(stock) || !category){
            CustomError.createError({
                name:"Product creation error",
                cause: generateProductErrorInfo({title,description,price,thumbnail,code,stock, category}),
                message: "Error Trying to create Product",
                code: EErrors.INVALID_TYPES_ERROR
            })
        }

        const newProduct = {
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            category,
        }
        
        const result = await productService.addProduct(newProduct) //agregamos el producto enviado por el cliente.
        console.log(result)
        req.logger.info(`Producto agregado: ${newProduct.title}`);
        res.status(201).send({status:"Sucess: Producto agregado" , payload: result})   //devolvemos un estado si se agrego correctamente.  
    } catch (error) {
        req.logger.error(`Error al agregar el producto: ${error.message}`);
        res.status(400).send({ error: 'Error al agregar el producto', details: error.message });

        console.log(error)
        return error;
    }
}

//modificar un producto por id 
export const updateProduct = async (req, res) => {
    try {
        const productID = req.params.pid //obtenemos el id de producto ingresado el cliente por paramas
        const updateData = req.body     //agregamos la informacion que actualizara el cliente en una variable
        const update = await productService.updateProduct(productID, { $set: updateData }); // actualizamos el producto filtrado
        const productUpdated = await productService.getProductById(productID)

        req.logger.info(`Producto actualizado: ${productUpdated.title}`);
        res.status(200).send({status:'Sucess: product updated', payload: productUpdated});
    } catch (error) {
        req.logger.error(`Error al modificar el producto: ${error.message}`);
        res.status(400).send('Error al eliminar el producto: ' + error.message);
        return error; 
    }
}

//eliminar un producto por id
export const deleteProduct = async (req, res) => {
    try {
        let {pid} = req.params //obtenemos el id de producto ingresado el cliente por paramas
        const productDeleted = await productService.deleteProduct(pid);  //eliminamos el producto deseado
        
        req.logger.info(`Producto eliminado: ${productDeleted.title}`);
        res.status(204).send({status:'Sucess: Producto eliminado'}); //devolvemos un estado si se elimino exitosamente
    } catch (error) {
        req.logger.error(`Error al eliminar el producto: ${error.message}`);
        res.status(400).send(`Error al eliminar el producto: ${error.message}`);
    }
}