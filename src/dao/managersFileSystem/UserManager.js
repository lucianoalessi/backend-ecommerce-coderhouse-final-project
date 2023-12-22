import fs from 'fs';
import path from 'path';
import __dirname from '../../../utils.js';

export default class UserManager{
    constructor(){
        this.path = path.join(__dirname,'./data/users.json');
    }

    getUsers = async () => {
        try {
            const users = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
            return users;
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('Archivo no encontrado, devolviendo array vacío.');
                return [];
            } else {
                console.error(error);
                throw new Error('Error al obtener usuarios');
            }
        }
    }

    getUserById = async (userId) => {
        try {
            const users = await this.getUsers();
            const user = users.find(user => user._id === userId);
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    getUserByEmail = async (userEmail) => {
        try {
            const users = await this.getUsers();
            const user = users.find(user => user.email === userEmail);
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    addUser = async (user) => {
        try {
            const {first_name, last_name, email, age, password, cart, role, documents, last_connection} = user;
            if(!first_name || !last_name || !email || !password ){
                throw new Error("Datos del usuario incompletos");
            }
            // Añadir validaciones adicionales aquí
            const userList = await this.getUsers();
            if(userList.find(u => u.email === email)){
                throw new Error("Email ya en uso");
            }
            user.age = age || null;
            user.cart = [cart] || [];
            user.documents = documents || [];
            user.role = role || 'user';
            user.last_connection = last_connection || Date.now();
            user._id = userList.length > 0 ? Math.max(...userList.map(u => u._id)) + 1 : 1; // Genera un nuevo _id
            userList.push(user);
            await fs.promises.writeFile(this.path, JSON.stringify(userList, null, 2));
            return user;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    updateUserById = async (idUser, user) => {
        try{
            const users = await this.getUsers();
            const updatedUsers = users.map(u => u._id === idUser ? {...u, ...user} : u);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
            return updatedUsers.find(u => u._id === idUser);
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    updateUserByEmail = async (userEmail, user) => {
        try{
            const users = await this.getUsers();
            const updatedUsers = users.map(u => u.email === userEmail ? {...u, ...user} : u);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
            return updatedUsers.find(u => u.email === userEmail);
        }catch(error){
            console.error(error);
            throw error;
        }
    }
    
    deleteUser = async (idUser) => {
        try{
            const users = await this.getUsers();
            const updatedUsers = users.filter(u => u._id !== idUser);
            await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
            return updatedUsers;
        }catch (error) {
            console.error(error);
            throw error;
        }
    }
}


//test:
// const userManager = new UserManager(path.join(__dirname,'./data/users.json'));

// const testUserManager = async () => {
//     console.log('Iniciando pruebas...');

//     // // Prueba: getUsers
//     // console.log('getUsers:');
//     // const users = await userManager.getUsers();
//     // console.log(users);

//     // // Prueba: getUserById
//     // console.log('getUserById:');
//     // const userById = await userManager.getUserById(users[0]._id);
//     // console.log(userById);

//     // // Prueba: getUserByEmail
//     // console.log('getUserByEmail:');
//     // const userByEmail = await userManager.getUserByEmail(users[0].email);
//     // console.log(userByEmail);

//     // Prueba: addUser
//     console.log('addUser:');
//     const newUser = {
//         first_name: 'Test',
//         last_name: 'User',
//         email: 'testuser@example.com',
//         password: 'password',
//         role: 'user'
//     };
//     const addedUser = await userManager.addUser(newUser);
//     console.log(addedUser);

//     // Prueba: updateUserById
//     console.log('updateUserById:');
//     const updatedUserById = await userManager.updateUserById(addedUser._id, { first_name: 'Updated' });
//     console.log(updatedUserById);

//     // Prueba: updateUserByEmail
//     console.log('updateUserByEmail:');
//     const updatedUserByEmail = await userManager.updateUserByEmail(addedUser.email, { last_name: 'Updated' });
//     console.log(updatedUserByEmail);

//     // // Prueba: deleteUser
//     // console.log('deleteUser:');
//     // const remainingUsers = await userManager.deleteUser(addedUser._id);
//     // console.log(remainingUsers);

//     console.log('Pruebas completadas.');
// };

// testUserManager().catch(console.error);




// import fs from 'fs';
// import path from 'path';

// export default class UserManager{
//     constructor(path){
//         this.path = path;
//     }

//     getUsers = async () => {
//         try {
//             const users = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
//             return users;
//         } catch (error) {
//             if (error.code === 'ENOENT') {
//                 console.log('Archivo no encontrado, devolviendo array vacío.');
//                 return [];
//             } else {
//                 console.error(error);
//                 throw new Error('Error al obtener usuarios');
//             }
//         }
//     }

//     getUserById = async (userId) => {
//         try {
//             const users = await this.getUsers();
//             const user = users.find(user => user._id === userId);
//             return user;
//         } catch (error) {
//             console.error(error);
//             throw new Error('Error al obtener usuario por ID');
//         }
//     }

//     getUserByEmail = async (userEmail) => {
//         try {
//             const users = await this.getUsers();
//             const user = users.find(user => user.email === userEmail);
//             return user;
//         } catch (error) {
//             console.error(error);
//             throw new Error('Error al obtener usuario por correo electrónico');
//         }
//     }

//     addUser = async (user) => {
//         try {
//             const {first_name, last_name, email, age, password, cart, role, documents, last_connection} = user;
//             if(!first_name || !last_name || !email || !password || !role){
//                 throw new Error("Datos del usuario incompletos");
//             }
//             const userList = await this.getUsers();
//             if(userList.find(u => u.email === email)){
//                 throw new Error("Email ya en uso");
//             }
//             // Asegurarse de que los campos opcionales tienen valores predeterminados si no se proporcionan
//             user.age = age || null;
//             user.cart = cart || [];
//             user.documents = documents || [];
//             user.last_connection = last_connection || Date.now();
//             userList.push(user);
//             await fs.promises.writeFile(this.path, JSON.stringify(userList, null, 2));
//             return user;
//         } catch (error) {
//             console.error(error);
//             throw new Error('Error al agregar usuario');
//         }
//     }

//     updateUserById = async (idUser, user) => {
//         try{
//             const users = await this.getUsers();
//             const updatedUsers = users.map(u => u._id === idUser ? {...u, ...user} : u);
//             await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
//             return user;
//         }catch(error){
//             console.error(error);
//             throw new Error('Error al actualizar usuario por ID');
//         }
//     }

//     updateUserByEmail = async (userEmail, user) => {
//         try{
//             const users = await this.getUsers();
//             const updatedUsers = users.map(u => u.email === userEmail ? {...u, ...user} : u);
//             await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
//             return user;
//         }catch(error){
//             console.error(error);
//             throw new Error('Error al actualizar usuario por correo electrónico');
//         }
//     }
    
//     deleteUser = async (idUser) => {
//         try{
//             const users = await this.getUsers();
//             const updatedUsers = users.filter(u => u._id !== idUser);
//             await fs.promises.writeFile(this.path, JSON.stringify(updatedUsers, null, 2));
//             return updatedUsers;
//         }catch (error) {
//             console.error(error);
//             throw new Error('Error al eliminar usuario');
//         }
//     }
// }


// //test:

// const userManager = new UserManager('./users.json');

// // Test getUsers
// userManager.getUsers().then(users => {
//     console.log('getUsers test:', users);
// }).catch(error => {
//     console.error('getUsers test error:', error);
// });

// // Test getUserById
// userManager.getUserById('someUserId').then(user => {
//     console.log('getUserById test:', user);
// }).catch(error => {
//     console.error('getUserById test error:', error);
// });

// // Test getUserByEmail
// userManager.getUserByEmail('someUserEmail').then(user => {
//     console.log('getUserByEmail test:', user);
// }).catch(error => {
//     console.error('getUserByEmail test error:', error);
// });

// // Test addUser
// userManager.addUser({
//     first_name: 'John',
//     last_name: 'Doe',
//     email: 'john.doe@example.com',
//     password: 'password123',
//     role: 'user'
// }).then(user => {
//     console.log('addUser test:', user);
// }).catch(error => {
//     console.error('addUser test error:', error);
// });

// // Test updateUserById
// userManager.updateUserById('someUserId', {first_name: 'Jane'}).then(user => {
//     console.log('updateUserById test:', user);
// }).catch(error => {
//     console.error('updateUserById test error:', error);
// });

// // Test updateUserByEmail
// userManager.updateUserByEmail('someUserEmail', {first_name: 'Jane'}).then(user => {
//     console.log('updateUserByEmail test:', user);
// }).catch(error => {
//     console.error('updateUserByEmail test error:', error);
// });

// // Test deleteUser
// userManager.deleteUser('someUserId').then(users => {
//     console.log('deleteUser test:', users);
// }).catch(error => {
//     console.error('deleteUser test error:', error);
// });


