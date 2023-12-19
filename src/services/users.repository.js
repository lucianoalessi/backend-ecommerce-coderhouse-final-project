export default class UsersRepository {
    constructor(dao) {
        this.dao = dao
    }

    getUsers = async () => {
        const users = await this.dao.getUsers();
        return users;
    }

    getUserById = async (id) => {
        const user = await this.dao.getUserById(id);
        return user;
    }

    getUserByEmail = async (email) => {
        const user = await this.dao.getUserByEmail(email);
        return user;
    }

    addUser = async (user) => {
        const result = await this.dao.addUser(user);
        return result;
    }

    updateUserById = async (userId, updates) => {
        const result = await this.dao.updateUserById(userId, updates);
        return result;
    }

    updateUserByEmail = async (email, updates) => {
        const result = await this.dao.updateUserByEmail(email, updates);
        return result;
    }

    deleteUser = async (userId) => {
        const result = await this.dao.deleteUser(userId);
        return result;
    }
}