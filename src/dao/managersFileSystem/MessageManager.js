import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

class messageManager{

    constructor() {
        this.path = path.join(__dirname, './data/messages.json');
    }

    getNextId = async () => {
        const messages = await this.getMessages();
        if (messages.length === 0) {
            return 1;
        }
        const maxId = Math.max(...messages.map(message => message._id));
        return maxId + 1;
    }

    getMessages = async () => {
        try{
            const messages = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(messages);
        }catch(error){
            console.error('No hay mensajes para leer',error.message); 
            return [];
        }
    }

    addMessages = async (message) => {
        try{
            const messages = await this.getMessages();
            message._id = await this.getNextId();
            messages.push(message);
            await fs.promises.writeFile(this.path, JSON.stringify(messages, null , 2)); //writeFile(ruta y nombre del archivo , contenido)
        }catch(error){
            console.error('No se pudo entregar el mensaje',error.message);
            return error;
        }
    }
}

export default messageManager;

//test: 
// console.log("Iniciando el test...");

// // Crear una instancia de messageManager
// const manager = new messageManager(path.join(__dirname, './data/messages.json'));

// // Prueba: Guardar un mensaje
// manager.addMessages({user: 'testUser', message: 'Hola, mundo!'})
//     .then(() => {
//         console.log("Nuevo mensaje guardado.");
//     })
//     .catch(error => {
//         console.error("Error al guardar el mensaje:", error.message);
//     });

// // Prueba: Obtener mensajes
// manager.getMessages()
//     .then(messages => {
//         console.log("Mensajes obtenidos:", messages);
//     })
//     .catch(error => {
//         console.error("Error al obtener los mensajes:", error.message);
//     });

// console.log("Test finalizado.");