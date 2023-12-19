import config from "../config/config.js";
import mongoose, { connect } from "mongoose";
import MongoStore from "connect-mongo";

export let carts;
export let products;
export let users;
export let tickets;
export let resetPasswordCodes;
export let messages;


switch (config.PERSISTENCE) {
    case 'MONGO':
        const connection = mongoose.connect(config.MONGO_URL);
        const {default:CartsMongo} = await import('./managersMongoDb/CartsManagerMongo.js');
        const {default:ProductsMongo} = await import('./managersMongoDb/ProductManagerMongo.js');
        const {default:UsersMongo} = await import('./managersMongoDb/UserManagerMongo.js');
        const {default:TicketsMongo} = await import('./managersMongoDb/TicketManagerMongo.js');
        const {default:ResetPasswordCodesMongo} = await import('./managersMongoDb/ResetPasswordCodeManagerMongo.js');
        const {default:MessagesMongo} = await import('./managersMongoDb/MessageManagerMongo.js');

        carts = CartsMongo;
        products = ProductsMongo;
        users = UsersMongo;
        tickets = TicketsMongo;
        resetPasswordCodes = ResetPasswordCodesMongo;
        messages = MessagesMongo;
    break;

    case 'FILE_SYSTEM':
        const {default:CartsFS} = await import('./managersFileSystem/CartManager.js');
        const {default:ProductsFS} = await import('./managersFileSystem/ProductManager.js');
        const {default:UsersFS} = await import('./managersFileSystem/UserManager.js');
        const {default:TicketsFS} = await import('./managersFileSystem/TicketManager.js');
        const {default:ResetPasswordCodesFS} = await import('./managersFileSystem/ResetPasswordCodeManager.js');
        const {default:MessagesFS} = await import('./managersFileSystem/MessageManager.js');
        
        carts = CartsFS;
        products = ProductsFS;
        users = UsersFS;
        tickets = TicketsFS;
        resetPasswordCodes = ResetPasswordCodesFS;
        messages = MessagesFS;
    break;
}
