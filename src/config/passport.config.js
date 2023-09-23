import passport from "passport";
import local from "passport-local";
import { userModel } from "../dao/models/user.js";
import {createHash , isValidPassword} from '../../utils.js'


const LocalStrategy = local.Strategy;
const initializePassport = () => {

    //Passport para el registro del usuario:
    passport.use('register', new LocalStrategy(
        {passReqToCallback:true , usernameField: 'email'}, async (req, username, password, done) => {
            const {first_name, last_name, email, age} = req.body; //El cliente pasa sus datos a travez de la vista por body.
            try {

                //comprobamos is el usuario ya existe:
                let user = await userModel.findOne({email:username});
                if(user){
                    console.log('User already exists')
                    return done(null, false);
                }
                //en caso de que no exista, creamos el usuario con el role: 'user'
                const newUser = {
                    first_name, 
                    last_name, 
                    email, 
                    age, 
                    password: createHash(password),
                    role: 'User'
                }
                let result = await userModel.create(newUser);
                return done(null,result); 
            } catch (error) {
                return done('Error al obtener el usuario:' + error)   
            }
        }
    ))
    
    //Passport para el login del usuario:
    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            //si el usuario que quiere loguearse es coderadmin:
            if (username === 'adminCoder@coder.com' && password === 'adminCoder123') { 
                const newUser = {
                    first_name: 'Coder',
                    last_name: 'Admin',
                    email: email,
                    age: 27,
                    password: password,
                    role: 'admin', 
                };
                return done(null, newUser) // se le envia el usuario = (newUser)
            }

            //Si se quiere loguear un usuario comun:
            const user = await userModel.findOne({email:username}) //busca el usuario ingresado por su email
            if(!user){
                console.log("User doesn't exist") // si el usuario no existe envia un error.
                return done(null, false); // no se le envia un usuario = (false)
            }
            if(!isValidPassword(user,password)){
                return done(null, false) // si la contraseña es incorrecta, tampoco se le envia un usuario = (false).
            }; 
            return done(null, user); // se le envia el usuario = (user)
        } catch (error) {
            return done(error); 
        }
    }));


    //serializacion y deserializacion:

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser( async(id, done) => {
        let user = await userModel.findById(id);
        done(null, user);
    });
    
}

export default initializePassport;





    
    
