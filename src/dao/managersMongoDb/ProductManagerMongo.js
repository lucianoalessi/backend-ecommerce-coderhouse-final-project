// Importamos el modelo de datos relacionado con los productos.
import { productModel } from '../models/product.model.js';

// Definimos la clase ProductManager que gestionará las operaciones relacionadas con los productos.
export default class ProductManager{

    constructor(){
        //constructor vacio por ahora.
    }

    //metodo para agrupar categorias Unicas. 
    categories = async () => {
        try {
            const categories = await productModel.aggregate([
                {
                    //stage 1: 
                    $group: {
                        _id: null, // Creamos un grupo sin campo de agrupación específico (todos los documentos se agrupan juntos)
                        categories: { $addToSet: "$category" } // Creamos un conjunto de categorías únicas a partir de la propiedad "category" en los documentos.addToSet no permite valores duplicados.
                    }
                }
            ])

            return categories[0].categories // Retornamos el arreglo de categorías únicas (en el primer elemento de "categories")

        }
        catch (err) {
            console.log(err);
            return err
        }

    }

    //metodo para paginar.
    getProductsQuery = async (filter, options) => {
        try {
            return await productModel.paginate(filter, options);

        } catch (err) {
            return err
        }
    };

    // Metodo que Utiliza el modelo "productModel" para buscar todos los productos en la base de datos y los convierte en objetos JSON.
    getProducts = async () => {
        try{
            return await productModel.find().lean()  //.lean() es un método que convierte los resultados en objetos JSON.
        }catch(error){
            console.log(error);
        }
    }

    // Agrega un nuevo producto a la base de datos.
    addProduct = async (product) => {

        await productModel.create(product)
    }

    // Obtiene un producto específico por su ID.
    getProductById = async (idProduct) => {

        return await productModel.findOne({ _id: idProduct })
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
            return await productModel.deleteOne({_id: idProduct})
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
