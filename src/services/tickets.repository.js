export default class TicketsRepository {
    constructor(dao) {
        this.dao = dao
    }

    getTickets = async () => {
        const tickets = await this.dao.getTickets();
        return tickets
    }

    getTicketById = async (ticketId) => {
        const ticket = await this.dao.getTicketById(ticketId);
        return ticket
    }

    addTicket = async (ticket) => {
        const result = await this.dao.addTicket(ticket);
        return result
    }

    updateTicket = async (idTicket, ticket) => {
        const ticketUpdated = await this.dao.updateTicket(idTicket, ticket)
        return ticketUpdated
    }

    deleteTicket = async (idTicket) => {
        const ticketToDeleted = await this.dao.deleteTicket(idTicket);
        return ticketToDeleted;
    }
}