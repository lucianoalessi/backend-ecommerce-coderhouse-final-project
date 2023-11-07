
//no sirve
import axios from "axios";

export const sendMail = async (req, res, next) => {
    try {
        await axios.get('http://localhost:8080/mail');
        next();
        
    } catch (error) {
        // Manejar errores si la solicitud GET falla
        console.error('Error al hacer la solicitud GET a /mail:', error);

        // Enviar una respuesta de error al cliente si es necesario
        res.status(500).send('Error al enviar el correo');
    }
}

export const redirectionHome = (req, res, next) =>{
    return res.redirect('/products');
    next();
}