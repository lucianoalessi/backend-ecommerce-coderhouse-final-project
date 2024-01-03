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


//Para eliminar un producto en el carrito
document.querySelectorAll('.delete-product').forEach(button => {
    button.addEventListener('click', async (event) => {
        const productId = event.target.dataset.productId;
        const cartId = document.getElementById('cart-id').textContent;

        try {
            const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto del carrito');
            }

            // Actualiza la página o elimina el producto del DOM
            location.reload();
        } catch (error) {
            console.error(error);
        }
    });
});

//Editar cantidad en el carrito
document.addEventListener('DOMContentLoaded', (event) => {
    const quantityInputs = document.querySelectorAll('#quantityInput');
    quantityInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            console.log(`La nueva cantidad del producto es: ${event.target.value}`);
            // Aquí puedes agregar el código para manejar la nueva cantidad
            const newQuantity = event.target.value;
            const productId = event.target.dataset.productid;
            console.log('===>>',productId)
            //const cartId = event.target.dataset.cartId;

            fetch(`/api/carts/${cartID}/product/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newQuantity }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                location.reload(); // Aquí se recarga la página
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    });
});
