import { Router } from "express"
import { userModel } from '../models/user.js'
import { createHash, isValidPassword } from "../../utils.js";
import { isValidObjectId } from "mongoose";
import passport from "passport";
//importamos los controllers:
import { 
    register, 
    failRegister, 
    loginSession,
    loginJWT,
    gitHubCallBack, 
    failLogin, 
    logOutJwt,
    logOutSession,
    resetPassword,
    newPassword
} from "../controllers/sessionsController.js";
//Importamos middlewares:
import { passportCall, authorization } from "../../utils.js";
//importamos DTOS:
import userDTO from "../dao/DTOs/userDTO.js";

//Importamod middleware para logger:
import { addLogger } from '../utils/logger.js';


//Inicializamos la extencion de express: Router
const router = Router()


//RUTAS:

//REGISTER:

//ruta para registrarse como usuario:
router.post('/register' , passport.authenticate('register',{session:false, failureRedirect:'/failregister'}) ,addLogger, register);

//en caso que la estrategia de registro falle:
router.get('/failregister',addLogger, failRegister);


//LOGIN:

// //Ruta para logearse con SESSION:
// router.post('/login', passport.authenticate('login',{failureRedirect:'/faillogin'}), loginSession);

//Ruta para logearse con JWT: 
router.post('/login', passport.authenticate('login',{session: false, failureRedirect:'/faillogin'}),addLogger, loginJWT);

//en caso que la estrategia de inicio de sesión falle:
router.get('/faillogin',addLogger, failLogin);


//CURRENT:

//ruta para devolver al usuario que inicia sesion SESSION
router.get('/current2',addLogger, async (req, res) => {
    res.send(req.user); 
});

//ruta para devolver al usuario que inicia sesion JWT
router.get('/current', passportCall('jwt'), authorization('user'),addLogger, (req,res) => {
    console.log(req.user)
    const user = new userDTO(req.user)
    res.send({status:"success", payload: user});
})


//LOGIN WITH GITHUB:

//ruta para logearse con Git Hub:
router.get('/github' , passport.authenticate('github',{scope:['user:email']}),addLogger, async(req,res) =>{
    // Esta ruta inicia la autenticación a través de GitHub utilizando la estrategia 'github'
    // y solicita acceso al alcance 'user:email' para obtener información del usuario y su correo electrónico
    // No se necesita lógica adicional en esta función, ya que Passport maneja la redirección a la página de inicio de sesión de GitHub
})

router.get('/githubcallback', passport.authenticate('github',{session:false, failureRedirect:'/login'}),addLogger, gitHubCallBack)
  // Esta ruta maneja el callback después de que el usuario se autentica con éxito a través de GitHub
    // Si la autenticación falla, redirige al usuario a '/login', de lo contrario, llegamos aquí
    // Almacenamos el usuario autenticado en la sesión para mantener su estado de autenticación
    //req.session.user = req.user;
    // Redirigimos al usuario a la página de productos
    //res.redirect('/products');

//LOG OUT:

//ruta para logOut JWT:
router.get('/logout',addLogger, logOutJwt);

// //ruta para logOut SESSION:
// router.get('/logout', logOutSession);


//RESET PASSWORD:
router.post('/resetpassword', resetPassword);

//new PASSWORD:
router.put('/newpassword', newPassword);






export default router;
