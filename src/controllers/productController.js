import productService from "../services/productService.js";

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
		res.status(200).send({ status: 'success', prods: prods });
	} catch (err) {
		res.status(400).send({ error: err.message });
	}
}

//obtener productos por id
export const getProductById = async (req, res) => {
    try{
        //obtenemos el producto por ID
        const {pid} = req.params
        const product = await productService.getProductById(pid)

        res.status(200).send({status:'success', product});
    }catch(error){
        res.status(400).send('Producto inexistente', error.message);
        return error;
    }
}

//agregar un producto nuevo
export const addProduct = async (req, res) => {
    try {
        const newProduct = req.body                             // la informacion que enviara el cliente estara dentro del req.body.
        const addProduct = await productService.addProduct(newProduct) //agregamos el producto enviado por el cliente.
        res.status(200).send({status:"Sucess: Producto agregado"})          //devolvemos un estado si se agrego correctamente.  
    } catch (error) {
        res.status(400).send('Error al agregar el producto:', error.message);
        return error;
    }
}

//modificar un producto por id 
export const updateProduct = async (req, res) => {
    try {
        const productID = req.params.pid //obtenemos el id de producto ingresado el cliente por paramas
        const update = req.body     //agregamos la informacion que actualizara el cliente en una variable
        const productUpdate = await productService.updateProduct(productID,update); // actualizamos el producto filtrado

        res.send({status:'Sucess: product updated', productUpdate});
    } catch (error) {
        res.status(400).send('Error al modificar el producto:', error.message);
        return error; 
    }
}

//eliminar un producto por id
export const deleteProduct = async (req, res) => {
    try {
        let {pid} = req.params                                 //obtenemos el id de producto ingresado el cliente por paramas
        const productDeleted = await productService.deleteProduct(pid);  //eliminamos el producto deseado
    
        res.send({status:'Sucess: Producto eliminado'});                //devolvemos un estado si se elimino exitosamente
    } catch (error) {
        res.status(400).send('Error al eliminar el producto:', error.message);
        return error; 
    }
}