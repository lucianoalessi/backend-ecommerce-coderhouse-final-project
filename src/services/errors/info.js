export const generateUserErrorInfo = (user) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    *first_name : needs to be a String, received ${user.first_name}
    *last_name  : needs to be a String, received ${user.last_name}
    *email      : needs to be a String, received ${user.email}
    *age        : needs to be a Number, received ${user.age}`
}


export const generateProductErrorInfo = (product) => {
    return `One or more properties were incomplete or not valid.
    List of required properties:
    *title      : needs to be a String, received ${product.title}
    *description: needs to be a String, received ${product.description}
    *price      : needs to be a Number, received ${product.price}
    *code       : needs to be a String, received ${product.code}
    *stock      : needs to be a Number, received ${product.stock}
    *category   : needs to be a String, received ${product.category}`
}