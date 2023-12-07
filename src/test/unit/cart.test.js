// Importamos las librerías necesarias
import { expect } from 'chai';
import mongoose from 'mongoose';
import config from '../../config/config.js';
import CartService from '../../services/cartService.js';
import ProductService from '../../services/productService.js';

// Comenzamos a describir las pruebas unitarias para el módulo de carritos
describe('Pruebas unitarias del módulo de carritos', () => {
    let testProduct;
    const productMock = {
        title: "Gabinete Corsair",
        description: "Gabinete gamer para PC de escritorio nuevo",
        price: 125,
        thumbnail: "No disponible",
        code: "PC127gfGTJYgdGGg",
        stock: 25,
        category: "PC",
    };
    let cartId;

    // Antes de ejecutar las pruebas, conectamos a la base de datos y generamos un producto de prueba
    before(async () => {
        await mongoose.connect(config.MONGO_URL);
        testProduct = await ProductService.addProduct(productMock);
    });

    // Después de ejecutar las pruebas, eliminamos las colecciones de carritos y productos
    after(async () => {
        await ProductService.deleteProduct(testProduct._id);
    });

    // Prueba para agregar un carrito
    it('Prueba de CartService.addCart', async () => {
        const cart = await CartService.addCart();
        expect(cart).to.have.property('_id');
        cartId = cart._id;
    });

    // Prueba para obtener un carrito
    it('Prueba de CartService.getCart', async () => {
        const cart = await CartService.getCartById(cartId);
        expect(cart).to.be.a('object').and.have.property('_id');
        const invalidCart = await CartService.getCartById('InvalidId');
        expect(invalidCart).to.not.have.property('_id');
    });

    // Prueba para agregar un producto al carrito
    it('Prueba de CartService.addProduct', async () => {
        const cart = await CartService.addProductToCart(cartId, testProduct._id);
        console.log(cart)
        expect(cart.products).to.be.a('array').and.not.have.length(0);
        expect(cart).to.have.property('_id');
        expect(cart._id.toString()).to.be.equal(cartId.toString());
        expect(cart).to.have.property('products').that.is.an('array').that.is.not.empty;
        const addedProduct = cart.products[0];
        expect(addedProduct).to.have.property('_id');
        expect(addedProduct.productID.toString()).to.be.equal(testProduct._id.toString());
    });

    // Prueba para eliminar productos del carrito
    it('Prueba de CartService.deleteProducts', async () => {
        await CartService.deleteProdInCart(cartId, testProduct._id);
        const cart = await CartService.getCartById(cartId);
        expect(cart.products).to.be.a('array').and.have.length(0);
    });

    // // Prueba para eliminar un carrito
    // it('Prueba de CartService.deleteCart', async () => {
    //     await CartService.deleteCart(cartId);
    //     const cart = await CartService.getCartById(cartId);
    //     expect(cart).to.be.null;
    // });
});