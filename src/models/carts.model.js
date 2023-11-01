// Importamos la biblioteca Mongoose para trabajar con MongoDB
import mongoose from 'mongoose';

// Definimos el nombre de la colección en la base de datos.
const cartCollection = 'Carts';

// Definimos el esquema (schema) para los datos que se almacenarán en la colección "Carts".
const cartSchema = new mongoose.Schema({

    // Definimos un campo "products" que será un array de objetos.
    products:{
        type:[
            // Cada objeto en el array "products" tiene dos campos: "_id" y "quantity".
            {
                productID:{    
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Products' //referenciamos con que lo vamos a popular.
                },
                quantity:{
                    type: Number,
                    default: 1
                }
            }
        ],
        default:[] // Si no se proporciona ningún valor para "products", se establece como un array vacío por defecto.
    }
});

//usamos populate para agregar los productos desde la base de datos al array de productos en el carro:
cartSchema.pre('find', function(){
    this.populate('products.productID');
});
// Crea un modelo de MongoDB basado en el esquema "cartSchema" y lo asocia a la colección "Carts".
export const cartModel = mongoose.model(cartCollection, cartSchema)