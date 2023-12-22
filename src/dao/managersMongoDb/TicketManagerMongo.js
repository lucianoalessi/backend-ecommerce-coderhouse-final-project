import { ticketModel } from '../../models/ticket.model.js';

export default class TicketManager{
    constructor(){
        //constructor vacio
    }

    //Metodo para obtener usuarios
    getTickets = async () => {
        try {
            return await ticketModel.find().lean()
        } catch (error) {
            console.log(error)
        }
    }
    //Metodo para obtener un usuario por ID
    getTicketById = async (ticketId) => {
        try {
            return await ticketModel.findById(ticketId).lean()
        } catch (error) {
            console.log(error)
        }
    }

    //Agrega un nuevo usuario a la base de datos.
    addTicket = async (ticketData) => {
        try {
            return await ticketModel.create(ticketData);
        } catch (error) {
            console.log(error)
        }
    }

    // Actualiza un usuario existente por su ID con los datos proporcionados en el objeto "user".
    updateTicket = async (idTicket, ticket) => {
        try{
            return await ticketModel.updateOne({ _id: idTicket } , ticket)
        }catch(error){
            console.log(error);
        }
    }
    
    // Elimina un producto existente por su ID.
    deleteTicket = async (idTicket) => {
        try{
            return await ticketModel.deleteOne({_id: idTicket})
        }catch (error) {
            console.log(error)
        }
    }
}