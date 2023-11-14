import  jwt  from "jsonwebtoken";
import nodemailer from 'nodemailer'
import config from "../config/config.js";


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


