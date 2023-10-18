// Importa el modelo de datos relacionado con los mensajes.
import { messageModel } from "../../models/message.model.js";

// Define una clase llamada messageManager que gestionará las operaciones relacionadas con los mensajes.
export default class messageManager{

    constructor() {
        //Constructor vacio por ahora
    }

    // Metodo para obtener todos los mensajes existentes en la base de datos.
    getMessages = async () => {
        try{
            const messages = await messageModel.find()
            return messages
        }catch(error){
            // En caso de error, registra un mensaje de error y devuelve el error.
            console.error('No hay mensajes para leer',error.message); 
            return error
        }
    }

    // Agrega un nuevo mensaje a la base de datos.
    addMessages = async (message) => {
        try{
            return await messageModel.create(message);
        }catch(error){
            // En caso de error, registra un mensaje de error y devuelve el error.
            console.error('No se pudo entregar el mensaje',error.message);
            return error;
        }
    }
}


