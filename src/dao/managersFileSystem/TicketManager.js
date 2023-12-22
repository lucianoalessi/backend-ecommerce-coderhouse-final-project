import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import __dirname from '../../../utils.js';

class TicketManager {
    constructor() {
        this.path = path.join(__dirname,'./data/tickets.json');
    }

    getTickets = async () => {
        try {
            const tickets = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
            return tickets;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Si el archivo no existe, crea un archivo vacío y devuelve un array vacío
                await fs.promises.writeFile(this.path, JSON.stringify([]));
                return [];
            } else {
                // Si ocurre otro error, lanza el error
                console.error('Error al obtener los tickets:', error.message); 
                throw error;
            }
        }
    }

    getTicketById = async (ticketId) => {
        try {
            const tickets = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
            return tickets.find(ticket => ticket._id === ticketId) || null; // Modificado para devolver null si el ticket no se encuentra
        } catch (error) {
            console.error('Ticket inexistente',error.message);    
            throw error; // Modificado para lanzar el error
        }
    }

    addTicket = async (ticket) => {
        try {
            const tickets = await this.getTickets();
            const newTicket = {
                _id: tickets.length === 0 ? 1 : Math.max(...tickets.map(ticket => ticket._id)) + 1, // Genera un ID único
                code: uuidv4(), // Genera un código único aleatorio
                purchase_datetime: Date.now(), // Fecha y hora exacta en la que se formalizó la compra
                amount: ticket.amount, // Total de la compra
                purchaser: ticket.purchaser // Correo del usuario asociado al carrito
            };
            tickets.push(newTicket);
            await fs.promises.writeFile(this.path, JSON.stringify(tickets, null , 2)); 
            return newTicket; // Devuelve el nuevo ticket
        } catch (error) {
            console.error('Error al generar el ticket',error.message);
            throw error; // Modificado para lanzar el error
        }
    }
    
    updateTicket = async (idTicket, updatedTicket) => {
        let tickets = await this.getTickets();
        tickets = tickets.map(ticket => {
            if (ticket._id === idTicket) {
                return {
                    ...updatedTicket, // Actualiza todos los datos del ticket
                    _id: idTicket // Mantiene el mismo _id
                };
            } else {
                return ticket;
            }
        });
        await fs.promises.writeFile(this.path, JSON.stringify(tickets, null , 2));
    }

    deleteTicket = async (idTicket) => {
        let tickets = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        tickets = tickets.filter(ticket => ticket._id !== idTicket);
        await fs.promises.writeFile(this.path, JSON.stringify(tickets));
    }
}

export default TicketManager;


//test:

// console.log("Iniciando el test...");

// // Crear una instancia de TicketManager
// const ticketManager = new TicketManager(path.join(__dirname,'./data/tickets.json'));

// // Prueba: Guardar un ticket
// ticketManager.addTicket({amount: 100, purchaser: 'test@example.com'})
//     .then(newTicket => {
//         console.log("Nuevo ticket guardado:", newTicket);

//         // Prueba: Obtener un ticket
//         ticketManager.getTicketById(newTicket._id)
//             .then(ticket => {
//                 console.log("Ticket obtenido:", ticket);

//                 // Prueba: Actualizar un ticket
//                 ticketManager.updateTicket(4, {code: 'newCode', purchase_datetime: Date.now(), amount: 5050510, purchaser: 'new@example.com'})
//                     .then(() => {
//                         console.log("Ticket actualizado exitosamente.");

//                         // // Prueba: Eliminar un ticket
//                         // ticketManager.deleteTicket(newTicket._id)
//                         //     .then(() => {
//                         //         console.log("Ticket eliminado exitosamente.");
//                         //     })
//                         //     .catch(error => {
//                         //         console.error("Error al eliminar el ticket:", error.message);
//                         //     });

//                     })
//                     .catch(error => {
//                         console.error("Error al actualizar el ticket:", error.message);
//                     });

//             })
//             .catch(error => {
//                 console.error("Error al obtener el ticket:", error.message);
//             });

//     })
//     .catch(error => {
//         console.error("Error al guardar el ticket:", error.message);
//     });

// console.log("Test finalizado.");