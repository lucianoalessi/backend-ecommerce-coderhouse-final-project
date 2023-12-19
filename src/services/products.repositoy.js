export default class ProductsRepository {
    constructor(dao) {
        this.dao = dao
    }

    getProductsQuery = async (limit, page, sort, query) => {
        const result = await this.dao.getProductsQuery(limit, page, sort, query);
        return result
    }

    getProducts = async () => {
        const result = await this.dao.getProducts();
        return result
    }

    getProductById = async (idProducto) => {
        const result = await this.dao.getProductById(idProducto);
        return result
    }

    addProduct = async (product) => {
        const result = await this.dao.addProduct(product);
        return result
    }


    updateProduct = async (idProducto, propertiesToUpdate) => {
        const result = await this.dao.updateProduct(idProducto, propertiesToUpdate);
        return result
    }

    deleteProduct = async (idProducto) => {
        const result = await this.dao.deleteProduct(idProducto);
        return result
    }
}