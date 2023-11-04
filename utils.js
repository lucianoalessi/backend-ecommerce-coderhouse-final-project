// Importamos las funciones necesarias desde los módulos 'url' y 'path':
import { fileURLToPath } from "url";
import { dirname } from "path";
// Importamos el módulo 'bcrypt' que se utiliza para el hash y la comparación de contraseñas:
import bcrypt from 'bcrypt';
//importamos passport
import passport from "passport";



//-----------HASH DE PASSWORD:----------------//

// Esta función toma una contraseña y la hashea utilizando bcrypt. Devuelve el hash resultante.
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Esta función verifica si una contraseña coincide con el hash almacenado para un usuario.
// Devuelve true si la contraseña es válida y false en caso contrario.
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

//---------------PATH:------------------------------//

// Las siguientes líneas de código obtienen la ruta actual del archivo (__filename) y su directorio (__dirname).
const __filename = fileURLToPath(import.meta.url) // __filename contiene la ruta del archivo actual.
const __dirname = dirname(__filename);// __dirname contiene el directorio del archivo actual.

export default __dirname;

//--------------JWT:---------------------------//

//Para jwt , extractor de token en Cookies
export const cookieExtractor = req => {
    let token;
    if (req && req.cookies) {  //corroboramos que hay alguna cookie que tomar
        token = req.cookies['coderCookie'] //tomamos solo la cookie que necesitamos
    }
    return token;
}

// export const bearerTokenExtractor = req => {
//     return req.headers.authorization.split(' ')[1];
// }

//---------------MIDDLEWARES:----------------------//

//Middleware Para los errores de token (jwt):
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

export const authorization = (role) => {
    return async(req, res, next)=> {
        if (!req.user) {
            return res.status(401).send({error: 'Unauthorized'});
        }
        if (req.user.role != role) {
            return res.status(403).send({error: 'No permissions'});
        }
        next();
    }
}


//-----------MOCK:----------//

import { Faker, es } from '@faker-js/faker';

//seteamos el idioma de los datos
const faker = new Faker({ locale: [es] }) 

// Exportamos una función que genera un objeto de productos
export const generateProduct = () => {
    return {
        title: faker.commerce.productName(), // Nombre del producto
        description: faker.commerce.productAdjective(), // Descripción del producto
        price: faker.commerce.price(), // Precio del producto
        //thumbnail: faker.image.imageUrl(), // Imagen en miniatura del producto
        code: faker.string.alphanumeric(10), // Código alfanumérico del producto
        stock: +faker.string.numeric(1), // Stock del producto
        category: faker.commerce.department(), // Categoría del producto
        _id: faker.database.mongodbObjectId(), // ID de MongoDB del producto
        // image: faker.image.image(),
    }
}
