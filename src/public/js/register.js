const form = document.getElementById('registerForm');

form.addEventListener('submit', e => {
    e.preventDefault()
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value); //transformamos el array de data a objeto con un forEach.
    
    
    
    fetch('api/sessions/register', {            //realizamos un post a la url indicada, enviandole el objeto por body. 
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type':'application/json'
        }
    }).then(result => result.json()).then(json => console.log(json)) //convertimos a json y lo mostramos por consola. 
    //mensaje
    alert('Te has registrado exitosamente!');
    // Borra los datos de los campos del formulario
    form.reset();
})


//otra forma:

// Obtén el formulario
// const form = document.getElementById('registerForm');

// // Agrega un event listener para el evento 'submit'
// form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     // Crea un objeto a partir de los datos del formulario
//     const data = Object.fromEntries(new FormData(form));

//     try {
//         // Realiza la petición POST
//         const response = await fetch('api/sessions/register', {
//             method: 'POST',
//             body: JSON.stringify(data),
//             headers: {
//                 'Content-Type':'application/json'
//             }
//         });

//         // Verifica si la petición fue exitosa
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         // Convierte la respuesta a JSON y muestra el resultado
//         const json = await response.json();
//         console.log(json);
//     } catch (error) {
//         console.log('Hubo un problema con la petición Fetch:', error);
//     }

//     // Borra los datos de los campos del formulario
//     form.reset();
// });