// Selecciono todos los botones con la clase 'card' y el id 'addToCart'
const addToCartButtons = document.querySelectorAll('.card button#addToCart'); // esto me devuelve un array con todos los botones

// Itero a través de cada botón encontrado
addToCartButtons.forEach((button) => {
  // Agrega un event listener para el evento 'click' en cada botón
  button.addEventListener('click', () => {
    // Encuentra el elemento padre más cercano con la clase 'card' al botón actual.(osea toma toda la tarjeta, ya que esta tiene la clase='card')
    const card = button.closest('.card');
    
    // Encuentra el elemento con la clase 'card-id' dentro de la tarjeta y obtiene su contenido de texto. 
    const productID = card.querySelector('.card-id').textContent;
    console.log(productID)
    // Realiza una solicitud (POST) a una API para agregar un producto al carrito. usamos el carrito 1 como predeterminado.
    fetch(`api/carts/64ffd4e3c9a5f9185e3994d4/product/${productID}`, {
      method: 'POST',
    })
      .then((response) => response.json()) // Convierte la respuesta en formato JSON
      .then((data) => {
        console.log(data); // Muestra los datos en la consola
      })
      .catch((error) => {
        console.error('Error:', error); // Manejamos los errores que puedan ocurrir durante la solicitud
      });
  });
});