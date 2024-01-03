import passport from "passport";
import local from "passport-local";
import jwt from 'passport-jwt';
import GitHubStrategy from 'passport-github2';
import { userService, cartService } from "../services/index.js";
import {cookieExtractor , createHash , isValidPassword} from '../../utils.js'
import config from './config.js'

//manejo de errores custom:
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enums.js";
import { generateUserErrorInfo } from "../services/errors/info.js";


const admin = {
    first_name: 'Coder',
    last_name: 'Admin',
    email: config.ADMIN_EMAIL,
    password: config.ADMIN_PASSWORD,
    role: 'admin'
};

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt; // Extractor de jwt ya sea de headers, cookies, etc


//Función para inicializar Passport y definir estrategias de autenticación
const initializePassport = async () => {

    //Estrategia de autenticación para el registro de usuarios:
    passport.use('register', new LocalStrategy(
        {passReqToCallback:true , usernameField: 'email' , session:false }, async (req, username, password, done) => {
            
            //El cliente pasa sus datos a travez de la vista por body.
            const {first_name, last_name, email, age} = req.body; 
            req.logger.info(`Passport - Registrando nuevo usuario con email: ${email}`);

            try {
                //custom error:
                if (!first_name || !last_name || !email || !age) {
                    CustomError.createError({
                        name:"User creation error",
                        cause: generateUserErrorInfo({first_name,last_name,email,age}),
                        message: "Error Trying to create User",
                        code: EErrors.INVALID_TYPES_ERROR
                    })
                    req.logger.error('Passport - Valores incompletos para el registro de usuario');
                    return done(null, false, { message: 'Incomplete Values' });
                }
                // Comprobamos si el usuario ya existe en la base de datos:
                let exist = await userService.getUserByEmail(username);
                if(exist){
                    req.logger.warning('Passport - El usuario ya existe');
                    return done(null, false, { message: 'User already exists' });
                }
                // Si el usuario no existe, creamos un nuevo usuario en la base de datos:
                const newUser = {
                    first_name, 
                    last_name, 
                    email, 
                    age,
                    cart: await cartService.createCart(),
                    password: createHash(password),
                }
                let result = await userService.addUser(newUser);
                req.logger.info(`Passport - Usuario registrado con éxito: ${email}`);
                return done(null,result); 
            } catch (error) {
                req.logger.error(`Passport - Error al obtener el usuario: ${error}`);
                return done('Error al obtener el usuario:' + error)   
            }
        }
    ))
    
    //Estrategia de autenticación para el inicio de sesión de usuarios(estrategia de autenticación local):
    passport.use('login', new LocalStrategy({ 
        usernameField: 'email', // Se define que el campo de nombre de usuario será el email
        session: false, // No se utilizarán sesiones
    }, async (username, password, done) => {
        try {
            //si el usuario que quiere loguearse es coderadmin:
            if (username === admin.email && password === admin.password) {
                const adminUser = admin
                return done(null, adminUser) // se le envia el usuario = (adminUser)
            }

            //Si se quiere loguear un usuario comun:
            //const user = await userModel.findOne({email:username}) //busca el usuario ingresado por su email
            const user = await userService.getUserByEmail(username) //busca el usuario ingresado por su email
            if(!user){
                // si el usuario no existe envia un error.
                return done(null, false ,{message: "No se encontro el usuario"}); // no se le envia un usuario = (false)
            }
            if(!isValidPassword(user,password)){
                return done(null, false , {message: "Contraseña incorrecta"}) // si la contraseña es incorrecta, tampoco se le envia un usuario = (false).
            };
            return done(null, user); // se le envia el usuario en forma de objeto con todos sus datos como sale de la base de datos = {user}
        } catch (error) {
            req.logger.error(`Passport - Error al iniciar sesión: ${error}`);
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
            // Buscamos un usuario por su dirección de correo electrónico en la base de datos
            let user = await userService.getUserByEmail(profile._json.email)
            // si el usuario no existia en nuestro sitio web, lo agregamos a la base de datos.
            if(!user){
                let newUser = {
                    first_name: profile._json.name,
                    last_name: ' ', //rellenamos los datos que no vienen desde el perfil.
                    age: 18, ////rellenamos los datos que no vienen desde el perfil.
                    cart: await cartService.createCart(),
                    email: profile._json.email,
                    password: '', //al ser una autenticacion de terceros, no podemos asignarle un password.
                    role: 'user'
                }
                let result = await userService.addUser(newUser);
                done(null, result);
            }else{ 
                // Si el usuario ya existe, simplemente lo autenticamos
                done(null, user);
            }
        }catch(error){
            done(error);
        }
    }))

    //Extrategia de autenticación con JWT:
    // Usamos el método 'use' de Passport para implementar la estrategia JWT (JSON Web Token)
    //Esta estrategia se encarga de extraer el token JWT de las solicitudes y verificar su validez.
    passport.use('jwt', new JWTStrategy({
        // 'jwtFromRequest' es una función requerida que acepta una solicitud como único parámetro
        // Extrae el JWT de la solicitud utilizando extractores personalizados (en este caso, 'cookieExtractor')
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        // 'secretOrKey' es la clave secreta utilizada para firmar los tokens.
        // Debe ser la misma que la utilizada en app.js/server.js para mantener la consistencia
        secretOrKey: 'CoderSecret' //debe ser el mismo que en app.js/server.js
        // Esta es la función de verificación que se ejecuta después de que se decodifica el token.
        // 'jwt_payload' es el objeto decodificado que se obtuvo del token.
        // 'done' es una función de callback que se llama al final de la función de verificación.
    }, async(jwt_payload, done) => {
        //NOTA: jwt_payload es el objeto que se obtiene después de decodificar el token JWT. Contiene la información del usuario que fue almacenada en el token cuando se creó. Esta información puede incluir detalles como el ID del usuario, el nombre de usuario, el correo electrónico, y cualquier otra información que se haya incluido al momento de la creación del token
        try {
            if(jwt_payload.email === admin.email){
                const adminUser = admin
                return done(null, adminUser);
            }
            // Si no hay errores, se llama a 'done' con el objeto 'jwt_payload' como segundo argumento y se autentica el usuario.
            return done(null, jwt_payload);
        } catch (error) {
            // Si hay un error, se llama a 'done' con el error como primer argumento.
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
        let user = await userService.getUserById(id); // Buscamos al usuario en la base de datos
        done(null, user); // Pasamos el objeto de usuario encontrado a través de 'done' para autenticación
    });
    
}

export default initializePassport;





    
    
