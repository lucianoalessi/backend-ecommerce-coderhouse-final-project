import { Router } from "express"
import passport from "passport";
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
import { passportCall} from "../../utils.js";
import { applyPolicy } from "../middlewares/authMiddleware.js";
//Importamod middleware para logger:
import { addLogger } from '../utils/logger.js';
//importamos DTOS:
import userDTO from "../dao/DTOs/userDTO.js";



//Inicializamos la extencion de express: Router
const router = Router()

// Middleware global para el logger
router.use(addLogger);


//RUTAS:

//#REGISTER:

//ruta para registrarse como usuario:
router.post('/register' , passport.authenticate('register',{session:false, failureRedirect:'/failregister'}), register);

//en caso que la estrategia de registro falle:
router.get('/failregister', failRegister);


//#LOGIN:

// //Ruta para logearse con SESSION:
// router.post('/login', passport.authenticate('login',{failureRedirect:'/faillogin'}), loginSession);

//Ruta para logearse con JWT: 
router.post('/login', passport.authenticate('login',{session: false, failureRedirect:'/faillogin'}), loginJWT);

//en caso que la estrategia de inicio de sesión falle:
router.get('/faillogin', failLogin);


//#CURRENT:

//ruta para devolver al usuario que inicia sesion SESSION
router.get('/current2', async (req, res) => {
    res.send(req.user); 
});

//ruta para devolver al usuario que inicia sesion JWT
router.get('/current', passportCall('jwt'), applyPolicy(['USER' , 'PREMIUM']), (req,res) => {
    console.log(req.user)
    const user = new userDTO(req.user)
    res.send({status:"success", payload: user});
})


//#LOGIN WITH GITHUB:

//ruta para logearse con Git Hub:
router.get('/github' , passport.authenticate('github',{scope:['user:email']}), async(req,res) =>{
    // Esta ruta inicia la autenticación a través de GitHub utilizando la estrategia 'github'
    // y solicita acceso al alcance 'user:email' para obtener información del usuario y su correo electrónico
    // No se necesita lógica adicional en esta función, ya que Passport maneja la redirección a la página de inicio de sesión de GitHub
})

router.get('/githubcallback', passport.authenticate('github',{session:false, failureRedirect:'/login'}), gitHubCallBack)
// Esta ruta maneja el callback después de que el usuario se autentica con éxito a través de GitHub
// Si la autenticación falla, redirige al usuario a '/login', de lo contrario, llegamos aquí
// Almacenamos el usuario autenticado en la sesión para mantener su estado de autenticación
//req.session.user = req.user;
// Redirigimos al usuario a la página de productos
//res.redirect('/products');

//#LOG OUT:

//ruta para logOut JWT:
router.get('/logout',passportCall('jwt'), logOutJwt);

// //ruta para logOut SESSION:
// router.get('/logout', logOutSession);


//#RESET PASSWORD:
router.post('/resetpassword', resetPassword);

//#NEW PASSWORD:
router.put('/newpassword', newPassword);






export default router;
