import passport from "passport";
import local from "passport-local";
import userService from '../dao/models/user.js'
import {createHash , isValidPassword} from '../../utils.js'


const LocalStrategy = local.Strategy;
const initializePassport = () => {
    passport.use('register', new LocalStrategy(
        {passReqToCallback:true , usernameField: 'email'}, async (req, username, password, done) => {
            const {first_name, last_name, email, age} = req.body;
            try {
                let user = await userService.findOne({email:username});
                if(user){
                    console.log('User already exists')
                    return done(null, false);
                }
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                }
                let result = await userService.create(newUser);
                return done(null,result); 
            } catch (error) {
                return done('Error al obtener el usuario:' + error)   
            }
        }
    ))
}

export default initializePassport;