import { Router } from "express"
import { userModel } from '../models/user.js'
import { createHash, isValidPassword } from "../../utils.js";
import { isValidObjectId } from "mongoose";
import passport from "passport";
//importamos los controllers 
import { 
    register, 
    failRegister, 
    loginSession,
    loginJWT, 
    failLogin, 
    logOutJwt,
    logOutSession
} from "../controllers/sessionsController.js";

import { passportCall, authorization } from "../../utils.js";
import userDTO from "../dao/DTOs/userDTO.js";


const router = Router()

//REGISTER:

//ruta para registrarse como usuario:
router.post('/register' , passport.authenticate('register',{session:false, failureRedirect:'/failregister'}) , register);

//en caso que la estrategia de registro falle:
router.get('/failregister', failRegister);


//LOGIN:

// //Ruta para logearse con SESSION:
// router.post('/login', passport.authenticate('login',{failureRedirect:'/faillogin'}), loginSession);

//Ruta para logearse con JWT: 
router.post('/login', passport.authenticate('login',{session: false, failureRedirect:'/faillogin'}), loginJWT);

//en caso que la estrategia de inicio de sesión falle:
router.get('/faillogin', failLogin);


//CURRENT:

//ruta para devolver al usuario que inicia sesion SESSION
router.get('/current2', async (req, res) => {
    res.send(req.user); 
});

//ruta para devolver al usuario que inicia sesion JWT
router.get('/current', passportCall('jwt'), authorization('user'), (req,res) => {
    console.log(req.user)
    const user = new userDTO(req.user)
    res.send({status:"success", payload: user});
})


//LOGIN WITH GITHUB:

//ruta para logearse con Git Hub:
router.get('/github' , passport.authenticate('github',{scope:['user:email']}), async(req,res) =>{
    // Esta ruta inicia la autenticación a través de GitHub utilizando la estrategia 'github'
    // y solicita acceso al alcance 'user:email' para obtener información del usuario y su correo electrónico
    // No se necesita lógica adicional en esta función, ya que Passport maneja la redirección a la página de inicio de sesión de GitHub
})

router.get('/githubcallback', passport.authenticate('github',{session:false, failureRedirect:'/login'}), async(req,res)=>{
    // Esta ruta maneja el callback después de que el usuario se autentica con éxito a través de GitHub
    // Si la autenticación falla, redirige al usuario a '/login', de lo contrario, llegamos aquí

    // Almacenamos el usuario autenticado en la sesión para mantener su estado de autenticación
    req.session.user = req.user;
    // Redirigimos al usuario a la página de productos
    res.redirect('/products');
})

//LOG OUT:

//ruta para logOut JWT:
router.get('/logout', logOutJwt);

// //ruta para logOut SESSION:
// router.get('/logout', logOutSession);

export default router;
