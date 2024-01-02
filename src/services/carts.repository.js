export default class CartsRepository {
    constructor(dao) {
        this.dao = dao
    }

    getAllCarts = async () => {
        const carts = await this.dao.getAllCarts();
        return carts
    }

    getCartById = async (idCart) => {
        const cart = await this.dao.getCartById(idCart);
        return cart
    }

    createCart = async (cart) => {
        const result = await this.dao.createCart(cart);
        return result
    }

    addProductToCart = async (idCart, idProduct) => {
        const result = await this.dao.addProductToCart(idCart, idProduct);
        return result
    }

    modifyQuantity = async (idCart, idProduct, newQuantity) => {
        const carts = await this.dao.modifyQuantity(idCart, idProduct, newQuantity);
        return carts
    }

    insertArrayOfProducts = async (idCart, arrayOfproducts) => {
        const result = await this.dao.insertArrayOfProducts(idCart, arrayOfproducts);
        return result
    }

    deleteProdInCart = async (idCart, idProduct) => {
        const carts = await this.dao.deleteProdInCart(idCart, idProduct);
        return carts
    }

    deleteAllProductsInCart = async (idCart) => {
        const carts = await this.dao.deleteAllProductsInCart(idCart);
        return carts
    }

    deleteCart = async (cartId) => {
        const cart = await this.dao.deleteCart(cartId);
        return cart
    }
}