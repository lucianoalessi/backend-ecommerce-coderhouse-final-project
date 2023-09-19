import { Router } from "express"
import { userModel } from '../dao/models/user.js'

const router = Router()


//ruta para logearse 
router.post('/login', async (req, res) => {
    
    const {email, password} = req.body;

    const user = await userModel.findOne({email, password}) //busca el usuario ingresado
    if(!user) return res.status(400).send({status:'error', error: 'credenciales incorrectas'}) // si el usuario no existe envia un error.

    if (email === 'adminCoder@coder.com' && password === 'adminCoder123') { //si el usuario que quiere loguearse es coderadmin
        const newUser = {
            first_name: 'Coder',
            last_name: 'Admin',
            email: email,
            age: 27,
            password: password,
            rol: 'admin',
        };
        req.session.user = newUser;
        return res.status(200).redirect('/products');
    }

    req.session.user = {  //si el usuario existe, crea la session. 
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age
    }
    res.send({status:'success', payload: req.session.user}) //si el usuario existe, devolvemos un 200 de success.(cuando es un success no hace falta poner 200)
})


//ruta para registrarse como usuario
router.post('/register' , async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    const exists = await userModel.findOne({ email });
    if (exists) {
        return res.status(400).send({ status: "error", error: "Ya existe usuario con ese email" });
    };
    const user = {
        first_name, last_name, email, age, password
    };
    let result = await userModel.create(user);
    res.send({status:"success", message: "User registered"})
})



//ruta para logOut
router.get('/logout', (req, res) => {
	// Destruye la sesión actual
	req.session.destroy((error) => {
		if (error) {
			console.error('Error al cerrar la sesión:', err);
			res.status(500).send('Error al cerrar la sesión');
		} else {
			// Redirige al usuario a la página de inicio de sesión
			res.clearCookie('connect.sid');
			res.redirect('/login');
		}
	})
});

export default router;
