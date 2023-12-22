import  jwt  from "jsonwebtoken";
import nodemailer from 'nodemailer'
import config from "../config/config.js";
import { userService } from "../services/index.js";
import { resetPasswordCodeService } from "../services/index.js";
import crypto from 'crypto';
import { createHash } from "../../utils.js";



// #Registro de usuarios
export const register = async (req, res) => {
    // Esta ruta maneja la autenticación de registro a través de Passport.js
    // Si la autenticación falla, redirige al usuario a '/failregister', de lo contrario, llegamos aquí
    req.logger.info('Session controller - Registro de usuario iniciado');
    res.status(200).send({status:"success", message: "User registered"});
    req.logger.info('Session controller - Registro de usuario completado exitosamente');
}

export const failRegister = async(req,res)=>{
    req.logger.error("Session controller - Failed Strategy");
    res.status(400).json({error:"Failed"});
}


// #Login de usuarios con SESSIONS
export const loginSession = async (req, res) => {
    // Esta ruta maneja la autenticación de inicio de sesión a través de Passport.js
    // Si la autenticación falla, redirige al usuario a '/faillogin', de lo contrario, llegamos aquí
    //req.logger.info('Inicio de sesión con SESSION iniciado');
    // Verificamos si la autenticación fue exitosa (req.user contiene al usuario autenticado)
    if(!req.user){
        // Si no hay un usuario en req.user, significa que las credenciales son inválidas
        // Respondemos con un código de estado 400 y un mensaje de error
        req.logger.error('Session controller - Credenciales inválidas');
        return res.status(400).json({status:'error' , error: 'Credenciales invalidas' })
    }

    // Una vez que el inicio de sesión es exitoso, actualiza last_connection
    req.user.last_connection = Date.now();
    await userService.updateUserById(req.user._id, req.user);
    // Eliminamos el campo de contraseña del objeto de usuario en la sesión, ya que es información sensible
    delete req.user.password; 

    //si el usuario existe y se loguea correctamente, crea la session:
    req.session.user = req.user // Almacenamos el usuario en la sesión
    req.logger.info(`Session controller - Usuario ${req.user._id} ha iniciado sesión`);
    // Respondemos con un objeto JSON que indica un inicio de sesión exitoso y enviamos los datos del usuario en 'payload'
    res.json({status:'success', payload: req.session.user});
}


// #Login de usuarios con JWT:
export const loginJWT = async (req, res) => {
    // Registramos en el logger que el inicio de sesión con JWT ha comenzado
    req.logger.info('Session controller - Inicio de sesión con JWT iniciado');
    // Creamos un objeto con los datos del usuario que queremos incluir en el token. el user es el que recibimos en el middleware de passport. (lo recibimos en el req)
    const serializedUser = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        role: req.user.role,
        email: req.user.email
    }

    // Actualizamos last_connection y guardamos el usuario
    req.user.last_connection = Date.now();
    await userService.updateUserByEmail(req.user.email, req.user);
    // Creamos un token JWT con los datos del usuario, una clave secreta y una duración de 1 hora
    const token = jwt.sign(serializedUser, process.env.JWT_SECRET , {expiresIn: '1h'})
    // Enviamos una cookie al cliente con el token JWT y respondemos con un estado de éxito y los datos del usuario
    res.cookie('coderCookie', token, {maxAge: 3600000, httpOnly: true, secure: true}).send({status:"success", payload: serializedUser});
    // Registramos en el logger que se ha generado un token JWT para el usuario
    req.logger.info(`Session controller - Token JWT generado para el usuario ${req.user._id}`);

    //enviamos un mail al usuario diciendo que ha iniciado session (esto es un extra, luego lo podemos usar para restablecer la contraseña):
    // const transport = nodemailer.createTransport({
    //     service: 'gmail',
    //     port: 587,
    //     auth: {
    //         user: process.env.EMAIL_USER,
    //         pass: process.env.EMAIL_PASSWORD
    //     }
    // });
    
    // let result;
    // try {
    //     result = await transport.sendMail({
    //         from:'Inicio de sesion en Coder App <' + process.env.EMAIL_USER + '>',
    //         to: req.user.email,
    //         subject: 'Correo de prueba',
    //         html:`
    //         <div>
    //             <h1>Has iniciado sesion en coder App!</h1>
    //         </div>
    //         `,
    //         attachments:[]
    //     })
    //     req.logger.info(`Correo de inicio de sesión enviado al usuario ${req.user.email}`);
    // } catch (error) {
    //     req.logger.error('Error enviando correo electrónico:', error);
    // }
}

// #Login con GITHUB:
export const gitHubCallBack = async (req, res) => {
    req.logger.info('Session controller - Inicio de sesión con JWT en Git Hub iniciado');
    const serializedUser = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        cart: req.user.cart,
        role: req.user.role
    }

    // Actualizamos last_connection y guardamos el usuario
    req.user.last_connection = Date.now();
    await userService.updateUserByEmail(req.user.email, req.user);

    const token = jwt.sign(serializedUser, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.cookie('coderCookie', token, { maxAge: 3600000, httpOnly: true });
    req.logger.info(`Session controller - Token JWT generado con Git Hub para el usuario ${req.user._id}`);
    res.redirect('/products')
}

export const failLogin = async(req,res) => {
    req.logger.error("Session controller - Failed Strategy");
    res.status(400).json({error:"Failed"}); // Respondiendo con un objeto JSON que indica el fallo
}

// #LogOut:
export const logOutJwt = async (req, res) => {
    try {
        // Actualizamos last_connection y guardamos el usuario
        req.user.last_connection = Date.now();
        await userService.updateUserByEmail(req.user.email, req.user);
        res.clearCookie('coderCookie');
        req.logger.info('Session controller - JWT logout exitoso');
        res.redirect('/');
    } catch (error) {
        req.logger.error('Session controller - Error al cerrar la sesión JWT:', error);
        return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
    }
}

export const logOutSession = (req, res) => {
	// Destruye la sesión actual
	req.session.destroy((error) => {
		if (error) {
			req.logger.error('Session controller - Error al cerrar la sesión:', error);
			res.status(500).send('Error al cerrar la sesión');
		} else {
			// Redirige al usuario a la página de inicio de sesión
			res.clearCookie('connect.sid');
            req.logger.info('Session controller - Logout de sesión exitoso');
			res.redirect('/login');
		}
	})
}



// #Controller para restablecer la contraseña
export const resetPassword = async (req, res, next) => {
    // Extraer el email del cuerpo de la solicitud
    const { email } = req.body;
    req.logger.info(`Restableciendo contraseña para el usuario: ${email}`);

    try {
        // Buscar al usuario por su email
        const user = await userService.getUserByEmail(email);
        // Verificar si el usuario existe
        if (!user) {
            // Si el usuario no existe, enviar un mensaje de error
            req.logger.warn('El correo electrónico no está registrado');
            return res.status(400).json({ message: 'El correo electrónico no está registrado' });
        }

        // Función para generar un código aleatorio
        const generateRandomCode = () => {
            return crypto.randomBytes(4).toString('hex');
        }

        // Generar un código aleatorio
        const code = generateRandomCode();
        req.logger.info(`Código generado: ${code}`);
        // Guardar el código de recuperación, el modelo de los resetCode esta configurado para que expiren en una hora. 
        const newCode = await resetPasswordCodeService.saveCode(email, code);
        req.logger.info(`Código guardado: ${newCode}`);
        
        //enviamos mail de recuperacion de password
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASSWORD
            }
        });
        
        try {
           let result = await transport.sendMail({
                from:'Coder App - recuperacion de contraseña <' + config.EMAIL_USER + '>',
                to: email,
                subject: "Código de recuperación de tu contraseña",
                html:`
                <div>
                    <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:<br><a href="http://localhost:8080/newpassword/${code}">http://localhost:8080/newpassword/${code}</a></p>
                    <p>El código para recuperar tu contraseña es: ${code}<br>Si no fuiste tú quién lo solicitó, ignora este mensaje.</p>
                </div>
                `,
                attachments:[]
            })
            req.logger.info(`Correo de inicio de sesión enviado al usuario ${email}`);
        } catch (error) { 
            console.log('Error:', error.message);
            req.logger.error(`Error enviando correo electrónico: ${error.message}`);
            return res.status(500).json({ message: 'Error enviando correo electrónico' });
        }

        // Enviar una respuesta exitosa
        res.status(200).json({status: 'success', message: 'Código de recuperación enviado exitosamente'});
    } catch (error) {
        // Registrar el error y pasar al siguiente middleware
        req.logger.error(error.message)
        next(error)
    }
}

// #Controller para reiniciar la contraseña
export const newPassword = async (req, res) => {
    req.logger.info('Reiniciando la contraseña');
    try {
        // Extraer el email y la contraseña del cuerpo de la solicitud
        const { code, password } = req.body;

        // Obtener el código de recuperación
        const resetCode = await resetPasswordCodeService.getCode(code);
        if (!resetCode) {
            req.logger.warn('Código de recuperación inválido');
            return res.status(400).json({ status: "error", message: "Código de recuperación inválido" });
        }
        
        // Crear un hash de la contraseña
        const passwordHash = createHash(password);
        // Definir los campos a actualizar
        const updates = { password: passwordHash };
        // Actualizar el usuario
        const updatedUser = await userService.updateUserByEmail(resetCode.email, updates);
        if (!updatedUser) {
            req.logger.error('Error al actualizar la contraseña del usuario');
            return res.status(500).json({ status: "error", message: "Error al actualizar la contraseña del usuario" });
        }
        // Enviar una respuesta exitosa
        req.logger.info('Contraseña actualizada con éxito');
        res.json({ status: "success", message: "Contraseña actualizada con éxito" });
    } catch (error) {
        req.logger.error(`Error al reiniciar la contraseña: ${error}`);
        res.status(500).json({ status: "error", message: "Error del servidor" });
    }
}