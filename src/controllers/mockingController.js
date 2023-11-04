import { generateProduct } from "../../utils.js";

export const mockingProducts = async (req,res) => {
    let products = [];
    for (let i = 0; i < 100 ; i++) {
        products.push(generateProduct());
    }
    res.send({status: 'success', payload: products});
}