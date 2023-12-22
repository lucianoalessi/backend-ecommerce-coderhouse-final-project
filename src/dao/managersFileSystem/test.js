import { cartService } from "../../services/index.js";
import { productService } from "../../services/index.js";

try {
    const product = await productService.getProductsQuery(10,10,1,1)
    console.log(product)
    const prod = await productService.getProductById(2);
    console.log(prod)
    
} catch (error) {
    console.log(error)
}
