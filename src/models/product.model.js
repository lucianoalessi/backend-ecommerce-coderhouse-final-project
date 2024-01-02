import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'

const productCollection = 'Products';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    thumbnail:{
        type: String,
        default: null,
        required: false // Ahora el campo no es requerido
    },
    code:{
        type:String,
        unique: true, // Se asegura que el código sea único
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true // Establecemos el valor por defecto en true
    },
    owner: {
        type: String,
        default: 'admin' // Si un producto se crea sin owner, se coloca por defecto “admin”.
    }
});

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model(productCollection, productSchema);