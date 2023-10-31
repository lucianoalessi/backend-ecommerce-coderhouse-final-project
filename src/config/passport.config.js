import passport from "passport";
import local from "passport-local";
import jwt from 'passport-jwt';
import GitHubStrategy from 'passport-github2';
import { userModel } from "../models/user.js";
import {cookieExtractor , createHash , isValidPassword} from '../../utils.js'
import config from './config.js'
import CartManager from "../dao/managersMongoDb/CartsManagerMongo.js";

const cartManager = new CartManager()

const admin = {
    first_name: 'Coder',
    last_name: 'Admin',
    email: config.ADMIN_EMAIL,
    password: config.ADMIN_PASSWORD,
    role: 'admin', 
};

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt; // Extractor de jwt ya sea de headers, cookies, etc


//Función para inicializar Passport y definir estrategias de autenticación
const initializePassport = async () => {

    //Estrategia de autenticación para el registro de usuarios:
    passport.use('register', new LocalStrategy(
        {passReqToCallback:true , usernameField: 'email' , session:false }, async (req, username, password, done) => {
            const {first_name, last_name, email, age} = req.body; //El cliente pasa sus datos a travez de la vista por body.
            try {

                if (!first_name || !last_name || !email || !age || !password) {
                    return done(null, false, { message: 'Incomplete Values' });
                }
                // Comprobamos si el usuario ya existe en la base de datos:
                let exist = await userModel.findOne({email:username});
                if(exist){
                    console.log('User already exists')
                    return done(null, false);
                }
                // Si el usuario no existe, creamos un nuevo usuario en la base de datos (le agregamos el rol=user):
                const newUser = {
                    first_name, 
                    last_name, 
                    email, 
                    age,
                    cart: await cartManager.addCart(),
                    password: createHash(password),
                    role: 'user'
                }
                let result = await userModel.create(newUser);
                return done(null,result); 
            } catch (error) {
                return done('Error al obtener el usuario:' + error)   
            }
        }
    ))
    
    //Estrategia de autenticación para el inicio de sesión de usuarios:
    passport.use('login', new LocalStrategy({ usernameField: 'email' , session: false }, async (username, password, done) => {
        try {
            //si el usuario que quiere loguearse es coderadmin:
            if (username === admin.email && password === admin.password) { 
                const adminUser = admin
                return done(null, adminUser) // se le envia el usuario = (adminUser)
            }

            //Si se quiere loguear un usuario comun:
            const user = await userModel.findOne({email:username}) //busca el usuario ingresado por su email
            if(!user){
                console.log("User doesn't exist") // si el usuario no existe envia un error.
                return done(null, false ,{message: "No se encontro el usuario"}); // no se le envia un usuario = (false)
            }
            if(!isValidPassword(user,password)){
                return done(null, false , {message: "Contraseña incorrecta"}) // si la contraseña es incorrecta, tampoco se le envia un usuario = (false).
            }; 
            return done(null, user); // se le envia el usuario = (user)
        } catch (error) {
            return done(error); 
        }
    }));

    //Estrategia de autenticación para iniciar sesión con GitHub:
    passport.use('github', new GitHubStrategy({
        clientID:"Iv1.5fa4626ba072b167",
        clientSecret: "ddc4da16191d83e241c2c02310d931bf18450e5b",
        callbackURL:"http://localhost:8080/api/sessions/githubCallback"
    }, async(accessToken, refreshToken, profile, done) => {
        try{
            console.log(profile); //console.log para la informacion que viene del perfil de GitHub. 
            let user = await userModel.findOne({email:profile._json.email}) // Buscamos un usuario por su dirección de correo electrónico en la base de datos
            if(!user){ // si el usuario no existia en nuestro sitio web, lo agregamos a la base de datos.
                let newUser = {
                    first_name: profile._json.name,
                    last_name: ' ', //rellenamos los datos que no vienen desde el perfil.
                    age: 18, ////rellenamos los datos que no vienen desde el perfil.
                    email: profile._json.email,
                    password: '', //al ser una autenticacion de terceros, no podemos asignarle un password.
                    role: 'user'
                }
                let result = await userModel.create(newUser);
                done(null, result);
            }else{ // Si el usuario ya existe, simplemente lo autenticamos
                done(null, user);
            }
        }catch(error){
            done(error);
        }
    }))

    //Extrategia con JWT:
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: 'CoderSecret' //debe ser el mismo que en app.js/server.js
    }, async(jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            return done(error);
        }
    }))


    // Serialización y deserialización de usuarios para las sesiones:

    //La serialización de usuarios es el proceso de convertir un objeto de usuario (o sus datos clave) 
    //en un formato que pueda ser almacenado en la sesión del usuario.
    //El objeto 'user' es el usuario autenticado, 'done' es una función de callback

    passport.serializeUser((user, done) => {
        done(null, user._id); // Almacenamos el '_id' del usuario en la sesión
    });
    
    //La deserialización de usuarios es el proceso inverso de la serialización. 
    //Convierte el identificador único del usuario (generalmente el _id en la base de datos) de 
    //la sesión en un objeto de usuario.
    // 'id' es el identificador único del usuario almacenado en la sesión

    passport.deserializeUser( async(id, done) => {
        let user = await userModel.findById(id); // Buscamos al usuario en la base de datos
        done(null, user); // Pasamos el objeto de usuario encontrado a través de 'done' para autenticación
    });
    
}

export default initializePassport;





    
    
