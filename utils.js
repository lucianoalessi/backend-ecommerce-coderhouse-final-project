// Importamos las funciones necesarias desde los módulos 'url' y 'path':
import { fileURLToPath } from "url";
import { dirname } from "path";

// Importamos el módulo 'bcrypt' que se utiliza para el hash y la comparación de contraseñas:
import bcrypt from 'bcrypt';

// Esta función toma una contraseña y la hashea utilizando bcrypt. Devuelve el hash resultante.
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Esta función verifica si una contraseña coincide con el hash almacenado para un usuario.
// Devuelve true si la contraseña es válida y false en caso contrario.
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

// Las siguientes líneas de código obtienen la ruta actual del archivo (__filename) y su directorio (__dirname).
const __filename = fileURLToPath(import.meta.url) // __filename contiene la ruta del archivo actual.
const __dirname = dirname(__filename);// __dirname contiene el directorio del archivo actual.

export default __dirname;
