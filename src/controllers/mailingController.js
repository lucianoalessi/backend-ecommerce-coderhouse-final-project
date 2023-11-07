import nodemailer from "nodemailer";
import config from "../config/config.js";

//endpoint para mailing:
const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD
    }
});

export const mailingController = async(req,res) =>{
    let result = await transport.sendMail({
        from:'coder test <congig.EMAIL_USER>',
        to: 'lucianoalessi9@hotmail.com',
        subject: 'Correo de prueba',
        html:`
        <div>
            <h1>Has iniciado sesion en coder App!</h1>
        </div>
        `,
        attachments:[]
    })
}

// //send email interno
// export const mailingController = async (email, subject, message, attachments ) => {
//     transport.sendMail({
//       from: config.emailFrom,
//       to: email,
//       subject: subject,
//       html: `${message}`,
//       attachments: attachments,
//     });
//   };


// // send email desde Postman
// export const mailingController = (req, res) => {
//   const { email, subject, message, attachments } = req.body;

//   transport
//     .sendMail({
//       from: config.emailFrom,
//       to: email,
//       subject: subject,
//       html: `${message}`,
//       attachments: attachments,
//     })
//     .then((info) => {
//       console.log(info);
//       res.send({ status: "success", message: "Email sent successfully" });
//     })
//     .catch((error) => {
//       console.log(error);
//       res.send({ status: "error", message: "Error sending email" });
//     });
// };

