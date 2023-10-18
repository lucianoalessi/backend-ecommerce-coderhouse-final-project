import { userModel } from '../models/user.js'
import { createHash, isValidPassword } from "../../utils.js";
import { isValidObjectId } from "mongoose";
import passport from "passport";

//registro de usuario (sessions)

export const register = async (req, res) => {
    // Esta ruta maneja la autenticación de registro a través de Passport.js
    // Si la autenticación falla, redirige al usuario a '/failregister', de lo contrario, llegamos aquí
    res.send({status:"success", message: "User registered"})
}

export const failRegister = async(req,res)=>{
    console.log("Failed Strategy");
    res.send({error:"Failed"}) // Respondiendo con un objeto JSON que indica un fallo
}


//login del usuario (sessions)

export const login = async (req, res) => {
    // Esta ruta maneja la autenticación de inicio de sesión a través de Passport.js
    // Si la autenticación falla, redirige al usuario a '/faillogin', de lo contrario, llegamos aquí

    // Verificamos si la autenticación fue exitosa (req.user contiene al usuario autenticado)
    if(!req.user){
        // Si no hay un usuario en req.user, significa que las credenciales son inválidas
        // Respondemos con un código de estado 400 y un mensaje de error
        return res.status(400).send({status:'error' , error: 'Credenciales invalidas' })
    }
    // Eliminamos el campo de contraseña del objeto de usuario en la sesión, ya que es información sensible
    delete req.user.password; 

    //si el usuario existe y se loguea correctamente, crea la session:
    req.session.user = req.user // Almacenamos el usuario en la sesión
    res.send({status:'success', payload: req.session.user}) // Respondemos con un objeto JSON que indica un inicio de sesión exitoso y enviamos los datos del usuario en 'payload'
}

export const failLogin = async(req,res) => {
    console.log("Failed Strategy");
    res.send({error:"Failed"}) // Respondiendo con un objeto JSON que indica el fallo
}



//Login con GITHUB



//log out

export const logOut = (req, res) => {
	// Destruye la sesión actual
	req.session.destroy((error) => {
		if (error) {
			console.error('Error al cerrar la sesión:', error);
			res.status(500).send('Error al cerrar la sesión');
		} else {
			// Redirige al usuario a la página de inicio de sesión
			res.clearCookie('connect.sid');
			res.redirect('/login');
		}
	})
}


