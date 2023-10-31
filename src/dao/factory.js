import config from "../config/config.js";
import mongoose, { connect } from "mongoose";
import MongoStore from "connect-mongo";

export let carts;
export let products;
export let messages;

switch (config.PERSISTENCE) {
    case MONGO:
        const connection = mongoose.connect(config.MONGO_URL);
        const {default:CartsMongo} = await import('./managersMongoDb/CartsManagerMongo.js');
        const {default:ProductsMongo} = await import('./managersMongoDb/ProductManagerMongo.js');
        const {default:MessagesMongo} = await import('./managersMongoDb/MessageManagerMongo.js');
        carts = CartsMongo;
        products = ProductsMongo;
        messages = MessagesMongo;
        break;

    case FILE_SYSTEM:
        const {default:CartsFS} = await import('./managersFileSystem/CartManager.js')
        const {default:ProductsFS} = await import('./managersFileSystem/ProductManager.js')
        carts = CartsFS;
        products = ProductsFS;
    break;
}
