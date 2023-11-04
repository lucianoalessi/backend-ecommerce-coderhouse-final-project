import { userModel } from '../../models/user.js';

export default class UserManager{
    constructor(){
        //constructor vacio
    }

    //Metodo para obtener usuarios
    getUsers = async () => {
        try {
            const users = await userModel.find().lean()
            return users
        } catch (error) {
            console.log(error)
        }
    }
    //Metodo para obtener un usuario por ID
    getUserById = async (userId) => {
        try {
            const user = await userModel.findById(userId).lean()
            return user
        } catch (error) {
            console.log(error)
        }
    }

    //Agrega un nuevo usuario a la base de datos.
    addUser = async (user) => {
        try {
            return await userModel.create(user)
        } catch (error) {
            console.log(error)
        }
    }

    // Actualiza un usuario existente por su ID con los datos proporcionados en el objeto "user".
    updateUser = async (idUser, user) => {
        try{
            return await userModel.updateOne({ _id: idUser } , user)
        }catch(error){
            console.log(error);
        }
    }
    
    // Elimina un producto existente por su ID.
    deleteUser = async (idUser) => {
        try{
            return await userModel.deleteOne({_id: idUser})
        }catch (error) {
            console.log(error)
        }
    }
}