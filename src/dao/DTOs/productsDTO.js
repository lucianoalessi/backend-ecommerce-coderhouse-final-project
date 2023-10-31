export default class productsDTO {
    constructor(product){
        //datos que recibiremos del frontend y podemos organizar/editar antes de guardarlo en la base de datos (osea lo dejamos lindo antes de enviarlo a nuestra BD):
        this.productName = product.name,
        this.productCode = product.code
    }
}