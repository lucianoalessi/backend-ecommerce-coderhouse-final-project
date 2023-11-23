import  jwt  from "jsonwebtoken";
import nodemailer from 'nodemailer'
import config from "../config/config.js";
import UserManager from "../dao/managersMongoDb/UserManagerMongo.js"
import ResetCodeManager from "../dao/managersMongoDb/ResetCodeManager.js";
import {sendEmailToUser} from '../../utils.js'
import crypto from 'crypto';
import { createHash } from "../../utils.js";


const userManager = new UserManager()
const resetCodeManager = new ResetCodeManager()

//registro de usuarios:

export const register = async (req, res) => {
    // Esta ruta maneja la autenticación de registro a través de Passport.js
    // Si la autenticación falla, redirige al usuario a '/failregister', de lo contrario, llegamos aquí
    req.logger.info('Registro de usuario iniciado');
    res.send({status:"success", message: "User registered"});
    req.logger.info('Registro de usuario completado exitosamente');
}

export const failRegister = async(req,res)=>{
    req.logger.error("Failed Strategy");
    res.send({error:"Failed"}) // Respondiendo con un objeto JSON que indica un fallo
}


//login de usuarios con SESSIONS:

export const loginSession = async (req, res) => {
    // Esta ruta maneja la autenticación de inicio de sesión a través de Passport.js
    // Si la autenticación falla, redirige al usuario a '/faillogin', de lo contrario, llegamos aquí
    req.logger.info('Inicio de sesión con SESSION iniciado');
    // Verificamos si la autenticación fue exitosa (req.user contiene al usuario autenticado)
    if(!req.user){
        // Si no hay un usuario en req.user, significa que las credenciales son inválidas
        // Respondemos con un código de estado 400 y un mensaje de error
        req.logger.error('Credenciales inválidas');
        return res.status(400).send({status:'error' , error: 'Credenciales invalidas' })
    }
    // Eliminamos el campo de contraseña del objeto de usuario en la sesión, ya que es información sensible
    delete req.user.password; 

    //si el usuario existe y se loguea correctamente, crea la session:
    req.session.user = req.user // Almacenamos el usuario en la sesión
    req.logger.info(`Usuario ${req.user._id} ha iniciado sesión`);
    res.send({status:'success', payload: req.session.user}) // Respondemos con un objeto JSON que indica un inicio de sesión exitoso y enviamos los datos del usuario en 'payload'
}

//login de usuarios con JWT:

export const loginJWT = async (req, res) => {
    req.logger.info('Inicio de sesión con JWT iniciado');
    const serializedUser = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        role: req.user.role,
        email: req.user.email
    }
    const token = jwt.sign(serializedUser, process.env.JWT_SECRET , {expiresIn: '1h'})
    res.cookie('coderCookie', token, {maxAge: 3600000, httpOnly: true, secure: true}).send({status:"success", payload: serializedUser});
    req.logger.info(`Token JWT generado para el usuario ${req.user._id}`);

    //enviamos un mail al usuario diciendo que ha iniciado session (esto es un extra, luego lo podemos usar para restablecer la contraseña):
    const transport = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    let result;
    try {
        result = await transport.sendMail({
            from:'Inicio de sesion en Coder App <' + process.env.EMAIL_USER + '>',
            to: req.user.email,
            subject: 'Correo de prueba',
            html:`
            <div>
                <h1>Has iniciado sesion en coder App!</h1>
            </div>
            `,
            attachments:[]
        })
        req.logger.info(`Correo de inicio de sesión enviado al usuario ${req.user.email}`);
    } catch (error) {
        req.logger.error('Error enviando correo electrónico:', error);
    }
    
}

//Login con GITHUB:
export const gitHubCallBack = async (req, res) => {
    req.logger.info('Inicio de sesión con JWT en Git Hub iniciado');
    const serializedUser = {
        _id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        cart: req.user.cart,
        role: req.user.role
    }

    const token = jwt.sign(serializedUser, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.cookie('coderCookie', token, { maxAge: 3600000 })
    req.logger.info(`Token JWT generado con Git Hub para el usuario ${req.user._id}`);
    res.redirect('/products')
}



export const failLogin = async(req,res) => {
    req.logger.error("Failed Strategy");
    res.send({error:"Failed"}) // Respondiendo con un objeto JSON que indica el fallo
}

//log out:

export const logOutJwt = (req, res) => {
    try {
        res.clearCookie('coderCookie');
        req.logger.info('JWT logout exitoso');
        res.redirect('/');
    } catch (error) {
        req.logger.error('Error al cerrar la sesión JWT:', error);
        return res.status(500).send({ status: 'error', error: 'Internal Server Error' });
    }
}

export const logOutSession = (req, res) => {
	// Destruye la sesión actual
	req.session.destroy((error) => {
		if (error) {
			req.logger.error('Error al cerrar la sesión:', error);
			res.status(500).send('Error al cerrar la sesión');
		} else {
			// Redirige al usuario a la página de inicio de sesión
			res.clearCookie('connect.sid');
            req.logger.info('Logout de sesión exitoso');
			res.redirect('/login');
		}
	})
}



// Función para restablecer la contraseña
export const resetPassword = async (req, res, next) => {
    // Extraer el email del cuerpo de la solicitud
    const { email } = req.body;

    try {
        // Buscar al usuario por su email
        const user = await userManager.getUserByEmail(email);
        console.log(user)
        // Verificar si el usuario existe
        if (!user) {
            // Si el usuario no existe, enviar un mensaje de error
            return res.status(400).json({ message: 'El correo electrónico no está registrado' });
        }

        // Función para generar un código aleatorio
        const generateRandomCode = () => {
            return crypto.randomBytes(4).toString('hex');
        }

        // Generar un código aleatorio
        const code = generateRandomCode();
        console.log(code)
        // Guardar el código de recuperación, el modelo de los resetCode esta configurado para que expiren en una hora. 
        const newCode = await resetCodeManager.saveCode(email, code);
        console.log(newCode)

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
            //req.logger.error('Error enviando correo electrónico:', error);
        }

        // Enviar una respuesta exitosa
        res.status(200).json({ message: 'Código de recuperación enviado exitosamente'});
    } catch (error) {
        // Registrar el error y pasar al siguiente middleware
        //req.logger.error(error.message)
        next(error)
    }
}

// Función para reiniciar la contraseña
export const newPassword = async (req, res) => {
    try {
        // Extraer el email y la contraseña del cuerpo de la solicitud
        const { code, password } = req.body;

        // Obtener el código de recuperación
        const resetCode = await resetCodeManager.getCode(code);
        if (!resetCode) {
            return res.status(400).json({ status: "error", message: "Código de recuperación inválido" });
        }
        
        // Crear un hash de la contraseña
        const passwordHash = createHash(password);

        // Definir los campos a actualizar
        const updates = { password: passwordHash };

        // Actualizar el usuario
        const updatedUser = await userManager.updateUserByEmail(resetCode.email, updates);
        if (!updatedUser) {
            return res.status(500).json({ status: "error", message: "Error al actualizar la contraseña del usuario" });
        }

        // Enviar una respuesta exitosa
        res.json({ status: "success", message: "Contraseña actualizada con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Error del servidor" });
    }
}