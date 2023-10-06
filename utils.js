// Importamos las funciones necesarias desde los módulos 'url' y 'path':
import { fileURLToPath } from "url";
import { dirname } from "path";

// Importamos el módulo 'bcrypt' que se utiliza para el hash y la comparación de contraseñas:
import bcrypt from 'bcrypt';
//importamos passport
import passport from "passport";





// Esta función toma una contraseña y la hashea utilizando bcrypt. Devuelve el hash resultante.
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Esta función verifica si una contraseña coincide con el hash almacenado para un usuario.
// Devuelve true si la contraseña es válida y false en caso contrario.
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

// Las siguientes líneas de código obtienen la ruta actual del archivo (__filename) y su directorio (__dirname).
const __filename = fileURLToPath(import.meta.url) // __filename contiene la ruta del archivo actual.
const __dirname = dirname(__filename);// __dirname contiene el directorio del archivo actual.


//Para jwt en Cookies
export const cookieExtractor = req => {
    let token;
    if (req && req.cookies) {
        token = req.cookies['coderCookie']
    }
    return token;
}

export const bearerTokenExtractor = req => {
    return req.headers.authorization.split(' ')[1];
}

export const passportCall = (strategy) => {
    return async(req, res, next) => {
        passport.authenticate(strategy, function(err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({error: info.messages ? info.messages: info.toString()})
            }
            req.user = user;
            next();
        }) (req, res, next);
    }
}


export default __dirname;
