export default class ResetTokensRepository {
    constructor(dao) {
        this.dao = dao
    }

    getCode = async (email, token) => {
        const resetToken = await this.dao.getCode(email, token);
        return resetToken
    }

    getAllCodes = async () => {
        const tokens = await this.dao.getAllCodes();
        return tokens
    }

    saveCode = async (email, token) => {
        const newToken = await this.dao.saveCode(email, token);
        return newToken
    }

    deleteCode = async (email, token) => {
        const deletedToken = await this.dao.deleteCode(email, token);
        return deletedToken
    }
}