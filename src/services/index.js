import { carts, products, users, tickets, resetPasswordCodes, messages } from '../dao/factory.js';

import CartsRepository from './carts.repository.js'
import ProductsRepository from './products.repositoy.js'
import UsersRepository from './users.repository.js'
import TicketsRepository from './tickets.repository.js'
import ResetPasswordCodesRepository from './resetPasswordCodes.repository.js'
import MessagesRepository from './messages.repository.js'

export const cartService = new CartsRepository(new carts());
export const productService = new ProductsRepository(new products());
export const userService = new UsersRepository(new users());
export const ticketService = new TicketsRepository(new tickets());
export const resetPasswordCodeService = new ResetPasswordCodesRepository(new resetPasswordCodes());
export const messageService = new MessagesRepository(new messages());


//EJEMPLO
// import Users from "../dao/Users.dao.js";
// import Pet from "../dao/Pets.dao.js";
// import Adoption from "../dao/Adoption.js";

// import UserRepository from "../repository/UserRepository.js";
// import PetRepository from "../repository/PetRepository.js";
// import AdoptionRepository from "../repository/AdoptionRepository.js";

// export const usersService = new UserRepository(new Users());
// export const petsService = new PetRepository(new Pet());
// export const adoptionsService = new AdoptionRepository(new Adoption());