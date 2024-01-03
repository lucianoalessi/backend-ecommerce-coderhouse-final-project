import { userService } from "../services/index.js"
import { cartService } from "../services/index.js";
import nodemailer from 'nodemailer'
import moment from 'moment';
import config from "../config/config.js";

// Controlador para manejar la lógica de usuarios premium
export const premiumController = async(req,res) =>{

    // Extraemos el uid del usuario desde los parámetros de la petición
    const {uid} = req.params;
    req.logger.info(`Manejando lógica de usuarios premium para el usuario con ID: ${uid}`);
    // Obtenemos el usuario por su uid
    const user = await userService.getUserById(uid)

    if(req.user.role === 'admin'){
        switch (user.role) {
            case 'user':
              user.role = 'premium';
              break;
            case 'premium':
              user.role = 'user';
              break;
        }
        // Actualizamos el usuario en la base de datos
        const updateUser = await userService.updateUserById(uid, user);
        req.logger.info(`Usuario actualizado a rol: ${user.role}`);
        // Enviamos una respuesta con estado 200 y el usuario actualizado
        res.status(200).send({ status: 'success', user: user });
        return;
    }

    //caso de que el usuario sea 'premium' y se quiera pasar a 'user' , no requiere chequeo de documentacion.
    // if(user.role === 'premium'){
    //     user.role = 'user'
    //     const updateUser = await userService.updateUserById(uid, user);
    // }

    // Definimos los documentos requeridos para ser usuario premium
    const REQUIRED_DOCUMENTS = ['identification', 'address_proof', 'account_statement'];

    // Verificamos si el usuario tiene todos los documentos requeridos
    if (REQUIRED_DOCUMENTS.every(doc => user.documents.map(document => document.name.split('.')[0]).includes(doc))) {
        // Si el usuario tiene todos los documentos, cambiamos su rol
        switch (user.role) {
          case 'user':
            user.role = 'premium';
            break;
          case 'premium':
            user.role = 'user';
            break;
        }
        // Actualizamos el usuario en la base de datos
        const updateUser = await userService.updateUserById(uid, user);
        req.logger.info(`Usuario actualizado a rol: ${user.role}`);
        // Enviamos una respuesta con estado 200 y el usuario actualizado
        res.status(200).send({ status: 'success', user: user });
    } else {
        // Si el usuario no tiene todos los documentos, enviamos un error
        req.logger.error('Faltan documentos requeridos');
        res.status(400).send('Faltan documentos requeridos');
    }
}

// Controlador para manejar la subida de documentos
export const uploadDocuments = async (req, res) => {

    try {
        // Obtenemos el usuario por su uid
        const user = await userService.getUserById(req.params.uid);
        // Si el usuario no existe, enviamos un error
        if (!user) {
            return res.status(404).send('User not found');
        }

        if(!req.files){
            return res.status(400).send({status:'error' , error:'No se puede guardar el archivo'})
        }

        let documents = req.files
        // Añadimos los documentos subidos al usuario
        documents.forEach(doc => {
            user.documents.push({
            name: doc.originalname,
            reference: doc.path
            });
        });
  
        // Guardamos el usuario actualizado en la base de datos
        await userService.updateUserById(req.params.uid, user);

    } catch (error) {
        // // Si hay un error, lo imprimimos en la consola
        console.log(error)
    }
}

// Controlador para obtener todos los usuarios
export const getUsers = async (req,res) => {
    // Obtenemos todos los usuarios
    const users = await userService.getUsers()
    req.logger.info(`Usuarios obtenidos: ${users.length}`);
    // Enviamos una respuesta con estado 200 y la lista de usuarios
    res.status(200).send({ status: 'success', users: users })
}

// DELETE users sin conexion mayor a 2 dias
export const deleteUsers = async (req, res) => {
    try {
        // Creamos una constante que representa la fecha y hora de hace exactamente dos días a partir de ahora
        const twoDaysAgo = moment().subtract(2, 'days').toDate();
        req.logger.info(`Fecha y hora de hace dos días: ${twoDaysAgo}`);
        // Recuperamos una lista de usuarios cuya última conexión fue antes de la fecha y hora almacenada en 'twoDaysAgo'
        const usersToDelete = await userService.getUsers({ last_connection: { $lt: twoDaysAgo } });
        req.logger.info(`Usuarios a eliminar: ${usersToDelete.length}`);

        // Configuramos nodemailer
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            } 
        });

        for (const user of usersToDelete) {
            // Enviamos correo electrónico
            if (user.email) {
                await transport.sendMail({
                    from: `Coder App <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: 'Tu cuenta ha sido eliminada',
                    text: `Hola ${user.first_name}, tu cuenta ha sido eliminada por inactividad.`,
                });
                req.logger.info(`Correo enviado a: ${user.email}`);
            } else {
                req.logger.warning(`No se pudo enviar correo a un usuario debido a que no tiene una dirección de correo electrónico definida.`);
            }

            await cartService.deleteCart(user.cart[0]._id);
            req.logger.info(`Carrito eliminado para el usuario: ${user._id}`);
        }

        await userService.deleteUsers({ _id: { $in: usersToDelete.map(user => user._id) } });
        req.logger.info(`Usuarios eliminados correctamente. Total eliminados: ${usersToDelete.length}`);
        res.json({ message: 'Usuarios eliminados correctamente' });
        
    } catch (error) {
        req.logger.error(`Error al eliminar usuarios: ${error}`);
        res.status(500).json({ message: 'Hubo un error al eliminar los usuarios' });  
    }
}

// DELETE users by ID
export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;
        // Recuperamos una lista de usuarios cuya última conexión fue antes de la fecha y hora almacenada en 'twoDaysAgo'
        const userToDelete = await userService.getUserById(uid);

        // Configuramos nodemailer
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            } 
        });

        // Enviamos correo electrónico
        if (userToDelete.email) {
            await transport.sendMail({
                from: `Coder App <${process.env.EMAIL_USER}>`,
                to: userToDelete.email,
                subject: 'Tu cuenta ha sido eliminada',
                text: `Hola ${userToDelete.first_name}, tu cuenta ha sido eliminada por inactividad.`,
            });
            req.logger.info(`Correo enviado a: ${userToDelete.email}`);
        } else {
            req.logger.warning(`No se pudo enviar correo a un usuario debido a que no tiene una dirección de correo electrónico definida.`);
        }

        await cartService.deleteCart(userToDelete.cart[0]._id);
        req.logger.info(`Carrito eliminado para el usuario: ${userToDelete._id}`);

        await userService.deleteUser(uid);
        res.json({ message: 'Usuario eliminado correctamente' });

    }catch (error) {
        req.logger.error(`Error al eliminar usuarios: ${error}`);
        res.status(500).json({ message: 'Hubo un error al eliminar los usuarios' });  
    }
}
