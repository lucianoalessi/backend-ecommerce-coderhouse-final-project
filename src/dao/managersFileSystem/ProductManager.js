import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

class ProductManager{

    constructor(){
        this.path = path.join(__dirname,'./data/products.json');
        this.products = [];
    }

    //# Metodo para obtener los productos y filtrar por query
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
            const filter = query ? JSON.parse(query) : {};
    
            // Leer todos los productos utilizando el método getProducts
            let products = await this.getProducts();
    
            // Filtrar y ordenar los productos
            if (Object.keys(filter).length > 0) {
                products = products.filter(product => {
                    for (let key in filter) {
                        if (product[key] !== filter[key]) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            if (sort) {
                products.sort((a, b) => sort * (a.price - b.price));
            }
    
            // Paginar los productos
            const totalPages = Math.ceil(products.length / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            products = products.slice(start, end);
    
            return {
                docs: products,
                totalDocs: products.length,
                limit: limit,
                totalPages: totalPages,
                page: page,
                pagingCounter: start + 1,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null
            };
        } catch (error) {
            console.log('Error al obtener productos con consulta:', error.message);
            return 'Error al obtener productos con consulta: ' + error.message;
        }
    }

    //# Metodo para obtener todos los productos
    getProducts = async () => {
        //Leemos el contenido del archivo almacenado en la ruta (path) y lo almacenamos en una variable.Luego con Json.Parse()lo convertimos a formato objeto para poder manipularlo.
        try{
            const productsList = await fs.promises.readFile(this.path,"utf-8")
            const productsListParse = JSON.parse(productsList)
            return productsListParse
        //en caso de que se genere un error debido a que no exista el archivo que se intenta leer debido a que todavia no se agrego ningun producto, devolvemos un array vacio.
        }catch{
            return [];
        }
    }

    //# Metodo para obtener un producto por ID
    getProductById = async (productId) => {
        //Almacenamos el contenido del archivo creado en una variable, el cual sera un array de objetos. con un for..of recorremos el arreglo hasta encontrar uno con el mismo id que se ingresa como parametro.
        const products = await this.getProducts()
        for(const item of products){
            if(item._id === productId){
                return item;
            }
        }
        return 'Not found'
    }

    //# Metodo para crear un producto
    addProduct = async (obj) => {
        const {title, description, price, thumbnail, code, stock, category} = obj;
        //verificamos que se ingresen todos los datos.
        if(!title || !description || !price || !thumbnail || !code || !stock || !category){
            console.error("ERROR: Datos del producto incompletos");
            return;
        }
        const productList = await this.getProducts();
        //definimos el objeto con los datos ingresados.
        const product = {
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            category,
            status: true,
            owner: 'admin'
        }

        //verificamos que no se ingrese un producto con un codigo existente.
        for( const item of productList){
            if(item.code === product.code){
                console.error('ERROR: Codigo existente');
                return
            }
        }
        
        //Definimos un id para cada producto de forma ascendente, segun su posicion en la lista de productos. 
        if(productList.length === 0){
            product._id = 1
        }else{
            //accedemos al objeto que se encuentra al final del array y le sumamos 1, para que sea de codigo unico y ascendente segun su posicion. 
            product._id = productList[productList.length -1]._id + 1;  
        }

        //En una sola linea seria asi(con operador ternario):
        //this.products.length > 0 ? this.products[this.products.length - 1].id + 1 : 1;

        productList.push(product);

        //creamos el archivo en la ruta (path) y le pasamos el array de objetos products converido a json. 
        await fs.promises.writeFile(this.path,JSON.stringify(productList,null,2)) // el segundo parametro de stringify es opcional asi que le pusimos null para salterarlo y el 3er parametro es el espacio de sangria. al pasarle un 2 estamos indicando que queremos que la cadena JSON tenga un nivel de sangría de 2 espacios.
    }

    //# Metodo para actualizar un producto por ID
    updateProduct = async (productId , productUpdate) => {

        const pid = productId
        const {title, description, price, thumbnail, code, stock} = productUpdate

        //verificamos que se ingresen todos los datos. 
        if( !title || !description || !price || !thumbnail || !code || !stock){
          console.error("ERROR: Datos del producto incompletos")
          return 
        }
        
        const currentProductsList = await this.getProducts()

        //verificamos que no se ingrese un producto con un codigo existente.
        for( const item of currentProductsList){
            if(item.code === code && item._id !== pid){ // si el codigo del producto ya existe en otro producto, dara error. el && item.id !== pid nos permite modificar el producto deseado sin tener que cambiar el codigo del mismo.  
                console.error('ERROR: Codigo existente');
                return
            }
        }

        //otra forma:

        // const existingCode = currentProductsList.find(item =>item.code===code)
        // if(existingCode){
        //      console.error('ERROR: Codigo existente')
        //      return}
        
        //recorremos el array con objetos productos hasta encontrar uno con el id ingresado como parametro y se actualiza el objeto con los datos ingresados.
        let newProductsList = currentProductsList.map(item => {
            if (item._id === pid) {
                const updatedProduct = {
                    _id: pid, // Mantén el mismo ID
                    title,
                    description,
                    price,
                    thumbnail,
                    code,
                    stock,
                };
                // Devuelve el producto actualizado si el ID coincide
                return updatedProduct; 
            }else{
                // Devuelve el producto actualizado si el ID coincide
                return item;
            }     
           
        });

        //sobreescribimos el archivo con el contenido actualizado.
        await fs.promises.writeFile(this.path,JSON.stringify(newProductsList,null,2));
    }
            
    //# Metodo para eliminar un producto por ID
    deleteProduct = async (searchId) => {
        // Leemos el contenido del archivo y lo guardamos en una variable. El contenido es un array de objetos.
        const productsList = await this.getProducts();

        // Verificamos que el producto con el ID pasado como parámetro exista
        const existingCode = productsList.find(product =>product._id===searchId)
        if(!existingCode){
            console.error('ERROR: Codigo inexistente')
            return
        }

        // Si el producto existe, guardamos en una variable todos los demás productos que posean un número de ID distinto al que pasamos por parámetro. O sea, eliminamos el producto.
        const updatedProductsList = productsList.filter(product => product._id !== searchId); 
        // Sobreescribimos el archivo con la lista de productos actualizada
        await fs.promises.writeFile(this.path,JSON.stringify(updatedProductsList,null,2))
        console.log('Producto eliminado correctamente')
        return updatedProductsList;  
    }
}

export default ProductManager;

// //Test

// // Crea una nueva instancia de ProductManager.
// const productManager = new ProductManager(path.join(__dirname,'./data/products.json'));

// // Ahora puedes usar los métodos de la clase ProductManager.
// // Por ejemplo, para agregar un nuevo producto:

// const newProduct = {
//     title: 'Test Product',
//     description: 'This is a test product',
//     price: 99.99,
//     thumbnail: 'test.jpg',
//     code: 'testfesfsgdrgdr',
//     stock: 10,
//     category: 'PC'
// };

// const anotherProduct = {
//     title: 'Test Product 2',
//     description: 'This is a test product 2 ',
//     price: 99.99,
//     thumbnail: 'test.jpg',
//     code: 'test 255 ',
//     stock: 15,
//     category: 'PC'
// };

// productManager.addProduct(newProduct).then(() => console.log('Producto agregado'));
// productManager.addProduct(anotherProduct).then(() => console.log('Producto agregado'));

// // O para obtener todos los productos:
// productManager.getProducts().then(products => console.log(products));

// // O para obtener un producto por ID:
// productManager.getProductById(1).then(product => console.log(product));

// O para eliminar un producto por ID:
//productManager.deleteProduct(1).then(() => console.log('Producto eliminado'));




// const productManager = new ProductManager('./products.json');
// (async () => {

//     //=========array vacio=================

//     const noProducts = await productManager.getProducts();
//     console.log('All Products:', noProducts);


//     //===============metodo addProduct:===============

//     await productManager.addProduct(
//         'Monitor Asus',
//         'Monitor led 24" 75hz',
//         59.99,
//         'path/to/image1.jpg',
//         'PRD001',
//         100
//     );

//     await productManager.addProduct(
//         'Samsung Galaxy S23',
//         'nuevo con caja sellada',
//         800.50,
//         'path/to/image2.jpg',
//         'PRD002',
//         15
//     );

//     await productManager.addProduct(
//         'Monitor presonus eris 5',
//         'Monitores de estudio',
//         300.25,
//         'path/to/image2.jpg',
//         'PRD003',
//         28
//     );

//     await productManager.addProduct(
//         'Monitor samsung',
//         'Monitor led 32" 144hz',
//         59.99,
//         'path/to/image1.jpg',
//         'PRD004',
//         22
//     );

//     await productManager.addProduct(
//         'Samsung Galaxy S23 ultra',
//         'nuevo con caja sellada',
//         100.50,
//         'path/to/image2.jpg',
//         'PRD005',
//         93
//     );

//     await productManager.addProduct(
//         'Monitores kkr 10',
//         'Monitores de estudio',
//         300.25,
//         'path/to/image2.jpg',
//         'PRD006',
//         82
//     );

//     await productManager.addProduct(
//         'Teclado mecanico logitech',
//         'teclado con switch blue',
//         25,
//         'path/to/image2.jpg',
//         'PRD007',
//         500
//     );

//     await productManager.addProduct(
//         'Parlante JBL Go 4',
//         'Parlante inalambrico Hi-Fi',
//         30,
//         'path/to/image2.jpg',
//         'PRD008',
//         102
//     );

//     await productManager.addProduct(
//         'Go Pro Hero 9',
//         'Camara de accion',
//         30,
//         'path/to/image2.jpg',
//         'PRD009',
//         12
//     );

//     await productManager.addProduct(
//         'Traje neopren Oneil',
//         'traje grueso neopren',
//         200,
//         'path/to/image2.jpg',
//         'PRD010',
//         5
//     );

//     //============metodo getProducts:=============

//     const allProducts = await productManager.getProducts();
//     console.log('All Products:', allProducts);

//     //==========metodo getProductByID:============

//     const productById = await productManager.getProductById(2);
//     console.log('Product with ID 1:', productById);

//     //============metodo updateProduct:==============

//     await productManager.updateProduct(
//         3, 
//         'Iphone 14 pro max',
//         'Importado desde EE.UU',
//         999.99,
//         'algo',
//         '1223456987',
//         114,
//     );

//     const updatedProduct = await productManager.getProductById(3);
//     console.log('Updated Product:', updatedProduct);

//     // ==============metodo deleteproduct:===================

//     await productManager.deleteProduct(27);
//     const remainingProducts = await productManager.getProducts();
//     console.log('Remaining Products:', remainingProducts);

// })();
