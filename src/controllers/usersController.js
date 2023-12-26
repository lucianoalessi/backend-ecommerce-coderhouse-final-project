import { userService } from "../services/index.js"

// Controlador para manejar la lógica de usuarios premium
export const premiumController = async(req,res) =>{

    // Extraemos el uid del usuario desde los parámetros de la petición
    const {uid} = req.params;
    req.logger.info(`Manejando lógica de usuarios premium para el usuario con ID: ${uid}`);
    // Obtenemos el usuario por su uid
    const user = await userService.getUserById(uid)

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
            // req.logger.error('Usuario no encontrado');
            return res.status(404).send('User not found');
        }

        if(!req.files){
            return res.status(400).send({status:'error' , error:'No se puede guardar el archivo'})
        }

        let documents = req.files
        console.log('=====>',documents)
        // Añadimos los documentos subidos al usuario
        documents.forEach(doc => {
            user.documents.push({
            name: doc.originalname,
            reference: doc.path
            });
        });
  
        // Guardamos el usuario actualizado en la base de datos
        await userService.updateUserById(req.params.uid, user);
        // req.logger.info('Documentos subidos con éxito');

    } catch (error) {
        // // Si hay un error, lo imprimimos en la consola
        console.log(error)
        // req.logger.error(`Error al subir documentos: ${error}`);
    }
}

// Controlador para obtener todos los usuarios
export const getUsers = async(req,res) => {
    // Obtenemos todos los usuarios
    const users = await userService.getUsers()
    req.logger.info(`Usuarios obtenidos: ${users.length}`);
    // Enviamos una respuesta con estado 200 y la lista de usuarios
    res.status(200).send({ status: 'success', users: users })
}