import { productService } from "../services/index.js";
import { userService } from "../services/index.js";
import nodemailer from 'nodemailer';
//manejo de errores custom:
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateProductErrorInfo } from "../services/errors/info.js";



// Controller para obtener los productos y filtrar por query
export const getProductsQuery = async (req, res) => {

    const { limit, page, sort, category  } = req.query;
    req.logger.info(`Obteniendo productos con los siguientes parámetros: limit=${limit}, page=${page}, sort=${sort}, category =${category }`);

	try {
        // Obtenemos los productos
		const products  = await productService.getProductsQuery(limit, page, sort, category );
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
        // if (pid.length !== 24) {
        //     throw new Error('El ID del producto no es válido');
        // }
        
        const product = await productService.getProductById(pid)

        if (!product) {
            throw new Error('404:Producto no encontrado');
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
        const {title, description, category, price, stock, code, } = req.body 
        
        // Validacion de los datos del producto
        if(!title || !description || !category || !price || isNaN(price) || !stock || isNaN(stock) || !code   ){
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
            category,
            price,
            stock,
            code,
            thumbnail: req.file ? `/static/products/${req.file.filename}` : '/static/products/default.png',
        }   

        const userId = req.user._id;
        const userRole = req.user.role

        //caso que el administrador quiera crear un producto
        if (!userId && userRole === 'admin') {
            const result = await productService.addProduct(newProduct)
            // Enviar respuesta exitosa
            res.status(201).send({status:"Sucess: Producto agregado" , payload: result})
            return;
        }

        //caso que un usuario cree un producto
        const user = await userService.getUserById(userId);
        if(user) newProduct.owner = user._id

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
    req.logger.info(`Actualizando producto con ID: ${productID} con los siguientes datos: ${JSON.stringify(updateData)}`)
    
    try{

        // Obtenemos el producto y el usuario propietario
        const product = await productService.getProductById(productID);

        // Verificamos si el producto existe
        if (!product) {
            return res.status(404).send('El producto no existe');
        }
        
        if(req.user.role == 'admin'){
            await productService.updateProduct(productID, { $set: updateData });
            // Obtenemos el producto actualizado Y Registramos la información
            const productUpdated = await productService.getProductById(productID);
            req.logger.info(`Producto actualizado: ${productUpdated.title}`);
            // Enviamos la respuesta al cliente
            return res.status(200).send({status:'Sucess: product updated', payload: productUpdated});
        }

        const user = await userService.getUserById(product.owner);
        
        // Verificamos si el usuario es el propietario del producto o si es admin
        if (req.user.role != 'admin' && product.owner != user._id) {
            return res.status(403).send('No tienes permiso para eliminar este producto');
        }

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
        // Obtenemos el id de producto ingresado el cliente por params
        const { pid } = req.params;

        // Obtenemos el producto y el usuario propietario
        const product = await productService.getProductById(pid);

        // Verificamos si el producto existe
        if (!product) {
            return res.status(404).send('El producto no existe');
        }

        if(req.user.role == 'admin'){
            await productService.deleteProduct(pid);
            req.logger.info(`Producto eliminado: ${product.title}`);
            return res.status(204).send({ status: 'Success: Producto eliminado' });
        }

        const user = await userService.getUserById(product.owner);
        
        // Verificamos si el usuario es el propietario del producto o si es admin
        if (req.user.role != 'admin' && product.owner != user._id) {
            return res.status(403).send('No tienes permiso para eliminar este producto');
        }

        // Eliminamos el producto
        await productService.deleteProduct(pid);
        req.logger.info(`Producto eliminado: ${product.title}`);

        // Si el usuario es premium, enviamos un correo electrónico
        if (user.role === 'premium') {
            // Configuramos nodemailer
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            // Enviamos el correo electrónico
            await transporter.sendMail({
                from: `Coder App: Ecommerce <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Tu producto ha sido eliminado',
                text: `Hola ${user.first_name}, tu producto "${product.title}" con ID: ${product._id} ha sido eliminado.`,
            });

            req.logger.info(`Correo enviado de Producto eliminado a: ${user.email}`);
        }

        // Enviamos la respuesta al cliente
        return res.status(204).send({ status: 'Success: Producto eliminado' });
    } catch (error) {
        // Registramos el error
        req.logger.error(`Error al eliminar el producto: ${error.message}`);
        // Enviamos el error al cliente
        return res.status(400).send(`Error al eliminar el producto: ${error.message}`);
    }
};