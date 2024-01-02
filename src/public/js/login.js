const form = document.getElementById('loginForm');

form.addEventListener('submit', e => {
    e.preventDefault()
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value); //transformamos el array de data a objeto con un forEach.
    fetch('/api/sessions/login', {            //realizamos un post a la url indicada, enviandole el objeto por body. 
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type':'application/json'
        }
    }).then(result =>{
        console.log(result.status)
        if(result.status === 200)   {       //si el usuario recibe todo bien le enviamos un 200
            window.location.replace('/products')    // lo redireccionamos a la pagina principal luego de logearse. 
        }
    })
})