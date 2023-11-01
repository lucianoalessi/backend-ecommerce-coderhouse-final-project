import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid'; //libreria que genera un codigo unico aleatorio.

const ticketCollection = 'Tickets';

const TicketSchema = new mongoose.Schema({
  code: { 
        type: String,
        default: () => uuidv4(), //libreria que genera un codigo unico aleatorio.
        //default: 'ORDER' + Date.now() + Math.floor(Math.random() * 10000 + 1)
        required: true, 
        unique: true 
    },
  purchase_datetime: { 
    //fecha y hora exacta en la cual se formalizó la compra
        type: Date, 
        default: Date.now 
    },
  amount: { 
    //total de la compra.
        type: Number, 
        required: true 
    },
  purchaser: {
    //contendrá el correo del usuario asociado al carrito
        type: String, 
        required: true 
    }
});

export const ticketModel = mongoose.model(ticketCollection, TicketSchema);
