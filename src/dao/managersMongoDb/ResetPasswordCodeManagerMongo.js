import { resetPasswordCodeModel } from "../../models/resetPasswordCode.model.js";

class resetPasswordCodeManager {
    constructor() {

    }
    getCode = async (code) => {
        const resetCode = await resetPasswordCodeModel.findOne({code}).lean();
        return resetCode;
    }

    getAllCodes = async () => {
        const codes = await resetPasswordCodeModel.find();
        return codes;
    }

    saveCode = async (email, code) => {
        const newCode = await resetPasswordCodeModel.create({email, code});
        return newCode;
    }

    deleteCode = async (email, code) => {
        const deletedCode = await resetPasswordCodeModel.deleteOne({email, code});
        return deletedCode;
    }
}

export default resetPasswordCodeManager;