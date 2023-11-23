import { resetCodeModel } from "../../models/resetCode.model.js";

class ResetCodeManager {
    constructor() {

    }
    getCode = async (code) => {
        const resetCode = await resetCodeModel.findOne({code}).lean();
        return resetCode;
    }

    saveCode = async (email, code) => {
        const newCode = await resetCodeModel.create({email, code});
        return newCode;
    }

    deleteCode = async (email, code) => {
        const deletedCode = await resetCodeModel.deleteOne({email, code});
        return deletedCode;
    }
}

export default ResetCodeManager;