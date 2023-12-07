import UserManager from "../dao/managersMongoDb/UserManagerMongo.js"

const userManager = new UserManager()

export const premiumController = async(req,res) =>{
    const {uid} = req.params
    const user = await userManager.getUserById(uid)

    switch (user.role) {
        case 'user':
            user.role = 'premium'
            break;
        case 'premium':
            user.role = 'user'
            break;
    }
    const updateUser = await userManager.updateUser(uid, user);
    res.status(200).send({ status: 'success', user: user })
    
}


export const getUsers = async(req,res) => {
    const users = await userManager.getUsers()
    res.status(200).send({ status: 'success', users: users })
}