import productService from "../services/productService.js";
//manejo de errores custom:
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateProductErrorInfo } from "../services/errors/info.js";


// Controller para obtener los productos y filtrar por query
export const getProductsQuery = async (req, res) => {

    const { limit, page, sort, query } = req.query;

	try {
        // Obtenemos los productos
		const products  = await productService.getProductsQuery(limit, page, sort, query);
        // Registramos la información de los productos obtenidos
        req.logger.info(`Productos obtenidos: ${products.length}`);
        // Enviamos la respuesta al cliente
		res.status(200).send({ status: 'success', payload: products  });
	} catch (err) {
        // Registramos el error
        req.logger.error(`Error al obtener productos: ${err.message}`);
        // Enviamos el error al cliente
		res.status(400).send({ error: err.message });
	}
}

//Controlador para obtener productos por id
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

//Agregar un producto nuevo
export const addProduct = async (req, res) => {
    try {
        // Obtenemos la informacion que envia el cliente a travez de req.body.
        const {title, description, price, thumbnail, code, stock, category} = req.body 
        
        // Validacion de los datos del producto
        if(!title || !description || !price || isNaN(price) || !code  || !stock || isNaN(stock) || !category){
            throw CustomError.createError({
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

        // Agregar el producto y registrar el resultado
        const result = await productService.addProduct(newProduct)
        req.logger.info(`Producto agregado: ${newProduct.title}`);

        // Enviar respuesta exitosa
        res.status(201).send({status:"Sucess: Producto agregado" , payload: result})
    } catch (error) {
        req.logger.error(`Error al agregar el producto: ${error.message}`);
        // Enviar respuesta de error
        res.status(400).send({ error: 'Error al agregar el producto', details: error.message });
    }
}

//Modificar un producto por ID
export const updateProduct = async (req, res) => {

    const productID = req.params.pid //obtenemos el id de producto ingresado el cliente por paramas
    const updateData = req.body     //agregamos la informacion que actualizara el cliente en una variable

    try{
        // Actualizamos el producto
        await productService.updateProduct(productID, { $set: updateData });
        // Obtenemos el producto actualizado Y Registramos la información
        const productUpdated = await productService.getProductById(productID);
        req.logger.info(`Producto actualizado: ${productUpdated.title}`);
        // Enviamos la respuesta al cliente
        res.status(200).send({status:'Sucess: product updated', payload: productUpdated});
    } catch (error) {
        // Registramos el error
        req.logger.error(`Error al modificar el producto: ${error.message}`);
        // Enviamos el error al cliente
        res.status(400).send('Error al eliminar el producto: ' + error.message);
    }
}

//Eliminar un producto por id
export const deleteProduct = async (req, res) => {
    try {
        //obtenemos el id de producto ingresado el cliente por paramas
        const {pid} = req.params 
        // Eliminamos el producto y obtenemos el producto eliminado
        const productDeleted = await productService.deleteProduct(pid);
        // Registramos la información del producto eliminado
        req.logger.info(`Producto eliminado: ${productDeleted.title}`);
        // Enviamos la respuesta al cliente
        res.status(204).send({status:'Sucess: Producto eliminado'});
    } catch (error) {
        // Registramos el error
        req.logger.error(`Error al eliminar el producto: ${error.message}`);
        // Enviamos el error al cliente
        res.status(400).send(`Error al eliminar el producto: ${error.message}`);
    }
}