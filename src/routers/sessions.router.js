import { Router } from "express"
import { userModel } from '../dao/models/user.js'
import { createHash, isValidPassword } from "../../utils.js";
import { isValidObjectId } from "mongoose";
import passport from "passport";


const router = Router()


//ruta para registrarse como usuario:
router.post('/register' , passport.authenticate('register',{failureRedirect:'/failregister'}) ,async (req, res) => {
    res.send({status:"success", message: "User registered"})
})

router.get('/failregister', async(req,res)=>{
    console.log("Failed Strategy");
    res.send({error:"Failed"})
})


//ruta para logearse:
router.post('/login', passport.authenticate('login',{failureRedirect:'/faillogin'}), async (req, res) => {
    
    if(!req.user){
        return res.status(400).send({status:'error' , error: 'Credenciales invalidas' })
    }
    delete req.user.password; //retiro el password del usuario de la session, ya que es un dato sensible. 

    //si el usuario existe y se loguea correctamente, crea la session:
    req.session.user = req.user
    res.send({status:'success', payload: req.session.user}) //si el usuario existe, devolvemos un 200 de success.(cuando es un success no hace falta poner 200)
})

router.get('/faillogin', async(req,res)=>{
    console.log("Failed Strategy");
    res.send({error:"Failed"})
})

//ruta para logearse con Git Hub:

router.get('/github' , passport.authenticate('github',{scope:['user:email']}), async(req,res) =>{})

router.get('/githubcallback', passport.authenticate('github',{failureRedirect:'/login'}), async(req,res)=>{
    req.session.user = req.user;
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
