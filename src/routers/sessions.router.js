import { Router } from "express"
import { userModel } from '../dao/models/user.js'
import { createHash, isValidPassword } from "../../utils.js";
import { isValidObjectId } from "mongoose";
import passport from "passport";


const router = Router()


//ruta para registrarse como usuario:
router.post('/register' , passport.authenticate('register',{failureRedirect:'/failregister'}) ,async (req, res) => {
    // Esta ruta maneja la autenticación de registro a través de Passport.js
    // Si la autenticación falla, redirige al usuario a '/failregister', de lo contrario, llegamos aquí
    res.send({status:"success", message: "User registered"})
})

//en caso que la estrategia de registro falle:
router.get('/failregister', async(req,res)=>{
    console.log("Failed Strategy");
    res.send({error:"Failed"}) // Respondiendo con un objeto JSON que indica un fallo
})


//ruta para logearse:
router.post('/login', passport.authenticate('login',{failureRedirect:'/faillogin'}), async (req, res) => {
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
})

//en caso que la estrategia de inicio de sesión falle:
router.get('/faillogin', async(req,res)=>{
    console.log("Failed Strategy");
    res.send({error:"Failed"}) // Respondiendo con un objeto JSON que indica el fallo
})


//ruta para logearse con Git Hub:
router.get('/github' , passport.authenticate('github',{scope:['user:email']}), async(req,res) =>{
    // Esta ruta inicia la autenticación a través de GitHub utilizando la estrategia 'github'
    // y solicita acceso al alcance 'user:email' para obtener información del usuario y su correo electrónico
    // No se necesita lógica adicional en esta función, ya que Passport maneja la redirección a la página de inicio de sesión de GitHub
})

router.get('/githubcallback', passport.authenticate('github',{failureRedirect:'/login'}), async(req,res)=>{
    // Esta ruta maneja el callback después de que el usuario se autentica con éxito a través de GitHub
    // Si la autenticación falla, redirige al usuario a '/login', de lo contrario, llegamos aquí

    // Almacenamos el usuario autenticado en la sesión para mantener su estado de autenticación
    req.session.user = req.user;
    // Redirigimos al usuario a la página de productos
    res.redirect('/products');
})

//ruta para logOut:
router.get('/logout', (req, res) => {
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
});

export default router;
