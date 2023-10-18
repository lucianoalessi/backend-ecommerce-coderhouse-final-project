import mongoose from "mongoose";

const collection = 'users';

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {type: String , unique: true},
    age: Number,
    password: String,
    cart: {
        type:[
            {
                cartId:{    
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Carts'
                }
            }
        ],
        default:[] // Si no se proporciona ningún valor para "carts", se establece como un array vacío por defecto.
    },
    role: {type:String , default:'user'}
});

userSchema.pre('find', function(){
    this.populate('cart.cartId');
});

export const userModel = mongoose.model(collection,userSchema)