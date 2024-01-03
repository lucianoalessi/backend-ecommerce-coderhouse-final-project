const socketCliente = io();

const messageInput = document.getElementById('message-input');
const form = document.getElementById('form')
const sendButton = document.getElementById('send-button');

let user;

Swal.fire({
    title: "Bienvenido",
    text: "Ingrese su nombre de usuario:",
    input: "text",
    allowOutsideClick: false,
    inputValidator: (value) => {
        if (!value) {
            return 'Necesitas escribir un nombre de usuario';
        }
    },
}).then(result => {     //result contiene información sobre si se confirmó la ventana emergente o se canceló.
    user = result.value  // Contiene el valor ingresado por el usuario en el campo de texto de la ventana emergente
    socketCliente.emit('authenticated', user);
})


//obtenemos los datos del formulario (el mensaje).
form.onsubmit=(e)=>{
    e.preventDefault()
    const message = messageInput.value.trim();  //valor del mensaje, eliminando los espacios. 

    if(message.length > 0){
        socketCliente.emit('message', { user: user, message: message })  //enviamos el usuario con el mensaje al servidor
        messageInput.value = ''; //reseteamos el input para los mensajes
    }
}

// recibimos la lista de mensajes del servidor
socketCliente.on('messageLogs', data => {
    if (!user) return;
    const messagesLog = document.getElementById('messages-log');
    let messages = "";

    //por cada elemento del array de mensajes recibidos, lo renderizamos de la siguiente manera:
    data.forEach(data => {
        messages = messages + `${data.user} dice: ${data.message} </br>`
    })
    messagesLog.innerHTML = messages;
})




















// sendButton.addEventListener('submit', enviarMensaje);

// const enviarMensaje = (e) => {

// 	e.preventDefault();
// 	const message = messageInput.value.trim();
//     console.log(message);

//     if(message.length > 0){
//         socketCliente.emit('message', { user: user, message: message })
//         messageInput.value = '';
//     }
// };


// socket.on('newUserConnected', user=>{
//     if (!user) return
//     Swal.fire({
//         toast: true,
//         position: "top-right",
//         text: "Nuevo usuario conectado",
//         title: `${user} se ha unido al chat`,
//         timer: 3000,
//         showConfirmButton: false
//     })
// })


// Swal.fire({
//     title: 'Bienvenido',
//     input: 'text',
//     inputLabel: 'ingrese su nombre de usuario',
//     showCancelButton: true, //mostrar boton de cancelar
//     showLoaderOnConfirm: true, //mostrar boton de confirmar
//     confirmButtonText: 'Ingresar', // texto del boton de confirmar 
//     //allowOutsideClick: false,   //click fuera del cuadro pára cerrar: false
//     allowOutsideClick: () => !Swal.isLoading()
//   }).then((result) => {    //Esta es una función que se ejecuta después de que se cierra la ventana emergente. result contiene información sobre si se confirmó la ventana emergente o se canceló.
//     if (result.isConfirmed) {   //Un booleano que indica si se confirmó la ventana emergente.
//         socket.emit('newUser', result.value);
//     }
//   })