export default class MessagesRepository {
    constructor(dao) {
        this.dao = dao
    }

    getMessages = async () => {
        const messages = await this.dao.getMessages();
        return messages
    }

    addMessages = async (message) => {
        const result = await this.dao.addMessages(message);
        return result
    }
}