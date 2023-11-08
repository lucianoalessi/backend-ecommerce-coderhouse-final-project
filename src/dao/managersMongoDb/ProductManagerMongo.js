// Importamos el modelo de datos relacionado con los productos.
import { productModel } from '../../models/product.model.js';

// Definimos la clase ProductManager que gestionará las operaciones relacionadas con los productos.
export default class ProductManager{

    constructor(){
        //constructor vacio por ahora.
    }

    //Get product con query, para poder ordenar y filtrar productos. 
	getProductsQuery = async (limit, page, sort, query) => {
		try {
            // Si no se proporciona un límite, se establece en 10 por defecto
            !limit && (limit = 10);
            // Si no se proporciona una página, se establece en 1 por defecto
            !page && (page = 1);
            // Si el ordenamiento es 'asc', se establece en 1
            sort === 'asc' && (sort = 1);
            // Si el ordenamiento es 'des', se establece en -1
            sort === 'des' && (sort = -1);

			// Se crea un filtro a partir de la consulta proporcionada, si no hay consulta, el filtro es un objeto vacío.
            //Ejemplo {"category": "una categoria"}
			const filter = query ? JSON.parse(query) : {};
			const queryOptions = { limit: limit, page: page, lean: true };

			if (sort === 1 || sort === -1) {
				queryOptions.sort = { price: sort };
			}

            //paginacion con sus propiedades para paginar:
			const getProducts = await productModel.paginate(filter, queryOptions);
			getProducts.isValid = !(page <= 0 || page > getProducts.totalPages); // verificamos si el número de página proporcionado es válido y dentro del rango de páginas disponibles. Si no lo es, entonces getProducts.isValid se establecerá en falso.
			getProducts.prevLink =
				getProducts.hasPrevPage &&
				`http://localhost:8080/products?page=${getProducts.prevPage}&limit=${limit}`;
			getProducts.nextLink =
				getProducts.hasNextPage &&
				`http://localhost:8080/products?page=${getProducts.nextPage}&limit=${limit}`;

			getProducts.status = getProducts ? 'success' : 'error';

			return getProducts;
		} catch (error) {
			console.log(error.message);
		}
	};


    //Metodo que Utiliza el modelo "productModel" para buscar todos los productos en la base de datos y los convierte en objetos JSON.
    getProducts = async () => {
        try{
            return await productModel.find().lean()  //.lean() es un método que convierte los resultados en objetos JSON.
        }catch(error){
            console.log(error);
        }
    }

    //Obtiene un producto específico por su ID.
    getProductById = async (idProduct) => {
        try {
            return await productModel.findOne({ _id: idProduct })
        } catch (error) {
            console.log(error)
        }
    }

    //Agrega un nuevo producto a la base de datos.
    addProduct = async (product) => {
        try {
            await productModel.create(product)
        } catch (error) {
            console.log(error)
        }
    }

    // Actualiza un producto existente por su ID con los datos proporcionados en el objeto "product".
    updateProduct = async (idProduct, product) =>{
        try{
            return await productModel.updateOne({ _id: idProduct } , product)
        }catch(error){
            console.log(error);
        }
    }
    
    // Elimina un producto existente por su ID.
    deleteProduct = async (idProduct) => {
        try{
            return await productModel.findByIdAndDelete(idProduct)
            //return await productModel.deleteOne({_id: idProduct})
        }catch (error) {
            console.log(error)
        }
    }
}







//Alternativas: 


// updateProduct = async (idProduct, product) => {
//     try {
//         return await productModel.findByIdAndUpdate(idProduct, { $set: product });
//     } catch (error) {
//         return error
//     }
//   }



// deleteProduct = async (idProduct) => {
    //     try {
    //         return await productModel.findByIdAndDelete(idProduct);
    //     } catch (error) {
    //         return error
    //     }
    // }





// //metodo para agrupar categorias Unicas. 
    // categories = async () => {
    //     try {
    //         const categories = await productModel.aggregate([
    //             {
    //                 //stage 1: 
                    
    //                 $group: {
    //                     _id: null, // Creamos un grupo sin campo de agrupación específico (todos los documentos se agrupan juntos)
    //                     categories: { $addToSet: "$category" } // Creamos un conjunto de categorías únicas a partir de la propiedad "category" en los documentos.addToSet no permite valores duplicados.
    //                 }
    //             }
    //         ])

    //         return categories[0].categories // Retornamos el arreglo de categorías únicas (en el primer elemento de "categories")

    //     }
    //     catch (err) {
    //         console.log(err);
    //         return err
    //     }

    // }

    // //metodo para paginar.
    // getProductsQuery = async (filter, options) => {
    //     try {
    //         return await productModel.paginate(filter, options);

    //     } catch (err) {
    //         return err
    //     }
    // };
