import { userModel } from '../../models/user.js';

export default class UserManager{
    constructor(){
        //constructor vacio
    }

    //Metodo para obtener usuarios
    getUsers = async (filter) => {
        try {
            const users = await userModel.find(filter).lean()
            return users
        } catch (error) {
            console.log(error)
            throw error
        }
    }
    //Metodo para obtener un usuario por ID
    getUserById = async (userId) => {
        try {
            const user = await userModel.findById(userId).lean()
            return user
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    //Metodo para obtener un usuario por ID
    getUserByEmail = async (userEmail) => {
        try {
            const user = await userModel.findOne({email: userEmail}).lean()
            return user
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    //Agrega un nuevo usuario a la base de datos.
    addUser = async (user) => {
        try {
            return await userModel.create(user)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    // Actualiza un usuario existente por su ID con los datos proporcionados en el objeto "user".
    updateUserById = async (idUser, user) => {
        try{
            return await userModel.updateOne({ _id: idUser } , user)
        }catch(error){
            console.log(error);
            throw error
        }
    }

    // Actualiza un usuario existente por su email con los datos proporcionados en el objeto "user".
    updateUserByEmail = async (userEmail, user) => {
        try{
            return await userModel.updateOne({ email: userEmail } , user)
        }catch(error){
            console.log(error);
            throw error
        }
    }
    
    // Elimina un producto existente por su ID.
    deleteUser = async (idUser) => {
        try{
            return await userModel.deleteOne({_id: idUser})
        }catch (error) {
            console.log(error)
            throw error
        }
    }

    //Eliminar usuarios
    deleteUsers = async (filter) => {
        try{
            return await userModel.deleteMany(filter)
        }catch (error) {
            console.log(error)
            throw error
        }
    }
}