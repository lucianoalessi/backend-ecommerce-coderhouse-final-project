import { Router } from "express"
import { userModel } from '../models/user.js'
import { createHash, isValidPassword } from "../../utils.js";
import { isValidObjectId } from "mongoose";
import passport from "passport";
import  jwt  from "jsonwebtoken";
//importamos los controllers 
import { 
    register, 
    failRegister, 
    login, 
    failLogin, 
    logOut 
} from "../controllers/sessionsController.js";


const router = Router()


//ruta para registrarse como usuario:
router.post('/register' , passport.authenticate('register',{failureRedirect:'/failregister'}) , register);

//en caso que la estrategia de registro falle:
router.get('/failregister', failRegister);

//ruta para logearse con SESSION:
router.post('/login', passport.authenticate('login',{failureRedirect:'/faillogin'}), login);

// //ruta para logearse con JWT: 
// router.post('/login', passport.authenticate('login',{session: false, failureRedirect:'/faillogin'}), async (req, res) => {
//     const serializedUser = {
//         id: req.user._id,
//         first_name: req.user.first_name,
//         last_name: req.user.last_name,
//         age: req.user.age,
//         role: req.user.role,
//         email: req.user.email
//     }
//     const token = jwt.sign(serializedUser, 'CoderSecret', {expiresIn: '1h'})
//     res.cookie('coderCookie', token, {maxAge: 3600000}).send({status:"success", payload: serializedUser});
// });

//en caso que la estrategia de inicio de sesión falle:
router.get('/faillogin', failLogin);

//ruta para devolver al usuario que inicia sesion SESSION
router.get('/current', async (req, res) => {
    res.send(req.user); 
});

// //ruta para devolver al usuario que inicia sesion JWT
// router.get('/current', passport.authenticate('jwt' , {session:false}), (req,res) => {
//     res.send(req.user);
// })

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
router.get('/logout', logOut);

export default router;
