import { userService } from "../services/index.js"

// Controlador para manejar la lógica de usuarios premium
export const premiumController = async(req,res) =>{

    // Extraemos el uid del usuario desde los parámetros de la petición
    const {uid} = req.params
    // Obtenemos el usuario por su uid
    const user = await userService.getUserById(uid)

    // Definimos los documentos requeridos para ser usuario premium
    const REQUIRED_DOCUMENTS = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];

    
    // Verificamos si el usuario tiene todos los documentos requeridos
    if (user.documents.some(doc => REQUIRED_DOCUMENTS.includes(doc.name))) {
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
        const updateUser = await userService.updateUser(uid, user);
        // Enviamos una respuesta con estado 200 y el usuario actualizado
        res.status(200).send({ status: 'success', user: user });
    } else {
    // Si el usuario no tiene todos los documentos, enviamos un error
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

        // Añadimos los documentos subidos al usuario
        documents.forEach(doc => {
            user.documents.push({
            name: doc.originalname,
            reference: doc.path
            });
        });
  
        // Guardamos el usuario actualizado en la base de datos
        await userService.updateUserById(req.params.uid, user);
  
        // Imprimimos un mensaje de éxito en la consola
        console.log('Documentos subidos con éxito');
    } catch (error) {
      // Si hay un error, lo imprimimos en la consola
      console.log(error);
    }
}

// Controlador para obtener todos los usuarios
export const getUsers = async(req,res) => {
    // Obtenemos todos los usuarios
    const users = await userService.getUsers()
    // Enviamos una respuesta con estado 200 y la lista de usuarios
    res.status(200).send({ status: 'success', users: users })
}