// Obtén la referencia al botón de vaciar carrito y al ID del carrito desde el HTML
const emptyButton = document.getElementById('empty-cart');
const cartID = document.getElementById('cart-id').textContent;
console.log(cartID)


// Función para vaciar el carrito
const empty = async (event) => {
    try {
        // Realiza una solicitud DELETE al endpoint correspondiente
        const response = await fetch(`/api/carts/${cartID}`, {
            method: 'DELETE',
        });

        // Convierte la respuesta en formato JSON
        const data = await response.json();

        // Muestra los datos en la consola
        console.log(data);
        // Actualiza la página sin recargar
        location.reload();
        
    } catch (error) {
        // Maneja los errores que puedan ocurrir durante la solicitud
        console.error('Error:', error);
    }
};

// Agrega un event listener para ejecutar la función 'empty' cuando se hace clic en el botón
emptyButton.addEventListener('click', empty);
