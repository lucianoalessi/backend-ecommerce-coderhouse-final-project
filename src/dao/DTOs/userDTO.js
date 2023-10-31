export default class userDTO {
    constructor(user){
        //datos que recibiremos del frontend y podemos organizar antes de enviarlos a la base de datos:
        this.firstName = user.first_name,
        this.lastName = user.last_name,
        this.age = user.age,
        this.email = user.email
    }
}