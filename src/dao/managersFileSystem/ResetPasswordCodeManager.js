import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

class ResetPasswordCodeManager {
    constructor() {
        this.path = path.join(__dirname,'./data/resetPasswordCodes.json');
    }
    
    getNextId = async () => {
        const resetCodes = await this.getAllCodes();
        if (resetCodes.length === 0) {
            return 1;
        }
        const maxId = Math.max(...resetCodes.map(code => code._id));
        return maxId + 1;
    }

    getCode = async (code) => {
        try {
            const resetCodes = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
            const resetCode = resetCodes.find(resetCode => resetCode.code === code);
            if (resetCode) {
                const now = new Date();
                const createdAt = new Date(resetCode.createdAt);
                const expiresAt = new Date(resetCode.expiresAt);
                if (now >= createdAt && now <= expiresAt) {
                    // Si el código de reinicio aún no ha expirado, se devuelve
                    return resetCode;
                }
            }
            // Si el código de reinicio no existe o ha expirado, se devuelve null
            return null;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Si el archivo no existe, crea un archivo vacío y devuelve null
                await fs.promises.writeFile(this.path, JSON.stringify([]));
                return null;
            } else {
                // Si ocurre otro error, lanza el error
                console.error('Error al obtener los códigos de reinicio:', error.message); 
                throw error;
            }
        }
    }

    getAllCodes = async () => {
        try {
            return JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Si el archivo no existe, crea un archivo vacío y devuelve null
                await fs.promises.writeFile(this.path, JSON.stringify([]));
                return [];
            } else {
                // Si ocurre otro error, lanza el error
                console.error('Error al obtener los códigos de reinicio:', error.message); 
                throw error;
            }
        }
    }

    saveCode = async (email, code) => {
        // Validación del correo electrónico
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (!emailRegex.test(email)) {
            throw new Error('Por favor, introduce un correo electrónico válido.');
        }

        const resetCodes = await this.getAllCodes()
        const EXPIRATION_TIME_SECONDS = 60 * 60; // Una hora en segundos
        const newCode = {
            _id: await this.getNextId(),
            email,
            code,
            createdAt: new Date(), // Fecha y hora exacta en la que se creó el código de reinicio
            expiresAt: new Date(Date.now() + EXPIRATION_TIME_SECONDS * 1000) // Fecha y hora de expiración
        };
        resetCodes.push(newCode);
        await fs.promises.writeFile(this.path, JSON.stringify(resetCodes, null , 2));
        return newCode;
    }


    deleteCode = async (email, code) => {
        let resetCodes = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        resetCodes = resetCodes.filter(resetCode => !(resetCode.email === email && resetCode.code === code));
        await fs.promises.writeFile(this.path, JSON.stringify(resetCodes));
    }
}

export default ResetPasswordCodeManager;


//TEST

// console.log("Iniciando el test...");

// // Crear una instancia de resetPasswordCodeManager
// const resetPasswordCodeManager = new ResetPasswordCodeManager(path.join(__dirname,'./data/resetPasswordCodes.json'));

// // Prueba: Guardar un código de reinicio
// resetPasswordCodeManager.saveCode('test@example.com', '123456')
//     .then(newCode => {
//         console.log("Nuevo código de reinicio guardado:", newCode);

//         // Prueba: Obtener un código de reinicio
//         resetPasswordCodeManager.getCode('123456')
//             .then(code => {
//                 console.log("Código de reinicio obtenido:", code);

//                 // // Prueba: Eliminar un código de reinicio
//                 // resetPasswordCodeManager.deleteCode('test@example.com', '123456')
//                 //     .then(() => {
//                 //         console.log("Código de reinicio eliminado exitosamente.");
//                 //     })
//                 //     .catch(error => {
//                 //         console.error("Error al eliminar el código de reinicio:", error.message);
//                 //     });

//             })
//             .catch(error => {
//                 console.error("Error al obtener el código de reinicio:", error.message);
//             });

//     })
//     .catch(error => {
//         console.error("Error al guardar el código de reinicio:", error.message);
//     });

// console.log("Test finalizado.");