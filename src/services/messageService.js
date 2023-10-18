import messageManager from "../dao/managersMongoDb/MessageManagerMongo.js";

const messageService = new messageManager();

export default messageService;