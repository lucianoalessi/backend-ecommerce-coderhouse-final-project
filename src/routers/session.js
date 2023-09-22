import { Router } from "express"
import { userModel } from '../dao/models/user.js'
import { createHash, isValidPassword } from "../../utils.js";
import { isValidObjectId } from "mongoose";

const router = Router()


//ruta para logearse:
router.post('/login', async (req, res) => {
    
    const {email, password} = req.body;

    //si el usuario que quiere loguearse es coderadmin:
    if (email === 'adminCoder@coder.com' && password === 'adminCoder123') { 
        const newUser = {
            first_name: 'Coder',
            last_name: 'Admin',
            email: email,
            age: 27,
            password: password,
            role: 'admin',
        };
        req.session.user = newUser;
        return res.status(200).redirect('/products');
    }

    //Si se quiere loguear un usuario comun:
    const user = await userModel.findOne({email: email}) //busca el usuario ingresado por su email
    if(!user) return res.status(400).send({status:'error', error: 'credenciales incorrectas'}) // si el usuario no existe envia un error.
    if(!isValidPassword(user,password)) return res.status(403).send({status:"error", error:"Incorrect password"});
    delete user.password; //retiro el password del usuario de la session, ya que es un dato sensible. 
    //si el usuario existe, crea la session:
    req.session.user = {  
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role
    }
    res.send({status:'success', payload: req.session.user}) //si el usuario existe, devolvemos un 200 de success.(cuando es un success no hace falta poner 200)
})


//ruta para registrarse como usuario:
router.post('/register' , async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body; //El cliente pasa sus datos a travez de la vista por body.

    //comprobamos is el usuario ya existe:
    const exists = await userModel.findOne({ email });
    if (exists) {
        return res.status(400).send({ status: "error", error: "Ya existe usuario con ese email" });
    };

    //en caso de que no exista, creamos el usuario con el role: 'user'
    const user = {
        first_name, 
        last_name, 
        email, 
        age, 
        password: createHash(password),
        role: 'User'
    };
    let result = await userModel.create(user);
    res.send({status:"success", message: "User registered"})
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
