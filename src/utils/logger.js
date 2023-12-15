import winston from "winston";
//importamos dotenv:
import config from '../config/config.js';

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warning: 'yellow',
        http: 'cyan',
        info: 'blue',
        debug: 'white'
    }
}

const devLogger = winston.createLogger({
    levels: customLevelsOptions.levels, //ahora los niveles se basaran en los definidos y no los que posee winston por defecto.
    transports: [
        new winston.transports.Console({
            level: 'debug', //el nivel debe coincidir con nuestra nueva configuracion(customLevelsOptions)
            
            //El formato solo definira el que se muestren los mensajes de otra forma
            //Ademas de colocar los colores que nos interesan.
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelsOptions.colors}),
                winston.format.simple()
            )
        })
    ]
})

const prodLogger = winston.createLogger({
    levels: customLevelsOptions.levels, 
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize({colors: customLevelsOptions.colors}),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './errors.log',
            level: 'info',
            format: winston.format.simple()
        })
    ]
})


const environment = config.NODE_ENV || 'DEVELOPMENT'

export const addLogger = (req,res,next) => {
    if (environment == 'DEVELOPMENT') {
        req.logger = devLogger;
    } else if (environment == 'PRODUCTION') {
        req.logger = prodLogger;
    }
    next();
}









// const logger = winston.createLogger({
//     levels: customLevelsOptions.levels, //ahora los niveles se basaran en los definidos y no los que posee winston por defecto.
//     transports: [
//         new winston.transports.Console({
//             level: 'info', //el nivel debe coincidir con nuestra nueva configuracion(customLevelsOptions)
            
//             //El formato solo definira el que se muestren los mensajes de otra forma
//             //Ademas de colocar los colores que nos interesan.
//             format: winston.format.combine(
//                 winston.format.colorize({colors: customLevelsOptions.colors}),
//                 winston.format.simple()
//             )
//         }),
//         new winston.transports.File({
//             filename: './errors2.log',
//             level: 'warning', //debe coincidir con nuestra configuracion custom
//             format: winston.format.simple()
//         }),
//         // new winston.transports.Console({level: 'http'}),
//         // new winston.transports.File({filename:'./errors.log', level:'warn'})
//     ]
// })


// export const addLogger = (req,res,next) => {
//     req.logger = logger;
//     req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString}`)
//     next();
// }
