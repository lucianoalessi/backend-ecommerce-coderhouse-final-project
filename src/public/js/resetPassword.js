// Obtenemos el formulario por su ID
const form = document.getElementById('resetpassword-form');

// Función para manejar la respuesta del servidor
const handleResponse = (result) => {
    // Imprimimos el estado de la respuesta en la consola
    console.log(result);
    // Creamos un mensaje basado en el estado de la respuesta
    const message = result.status === 'success' 
        ? 'Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña.' 
        : `Error: ${result.message}`;
    // Mostramos el mensaje en una alerta
    alert(message);
};

// Función para manejar los errores
const handleError = (error) => {
    // Imprimimos el error en la consola
    console.error('Error:', error);
    // Mostramos un mensaje de error en una alerta
    alert('Ha ocurrido un error. Por favor, inténtalo de nuevo.');
};

// Función para validar los datos del formulario
const validateFormData = (data) => {
    // verificamos que el correo electrónico tenga un formato válido
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(data.get('email'))) {
        alert('Por favor, introduce un correo electrónico válido.');
        return false;
    }
    // Si todos los datos son válidos, devolvemos true
    return true;
};

// Agregamos un evento de envío al formulario
form.addEventListener('submit', e => {
    // Prevenimos la acción por defecto del formulario
    e.preventDefault();
    // Creamos un objeto FormData con los datos del formulario
    const data = new FormData(form);
    // Convertimos los datos del formulario en un objeto
    const obj = Object.fromEntries(data);

    // Antes de hacer la petición, validamos los datos del formulario
    if (!validateFormData(data)) {
        return;
    }

    // Hacemos una petición fetch a la API
    fetch('api/sessions/resetpassword', {            
        method: 'POST', // Método de la petición
        body: JSON.stringify(obj), // Cuerpo de la petición
        headers: {
            'Content-Type':'application/json' // Tipo de contenido de la petición
        }
    })
    .then(response => response.json()) // Convertimos la respuesta en JSON
    .then(handleResponse) // Manejamos la respuesta
    .catch(handleError); // Manejamos los errores
});