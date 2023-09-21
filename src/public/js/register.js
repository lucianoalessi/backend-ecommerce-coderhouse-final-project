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
    // Borra los datos de los campos del formulario
    form.reset();
})