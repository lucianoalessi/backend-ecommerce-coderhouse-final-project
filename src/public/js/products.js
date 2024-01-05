// Selecciono todos los botones con la clase 'card' y el id 'addToCart'
const addToCartButtons = document.querySelectorAll('.card button#addToCart');

// Itero a través de cada botón encontrado
addToCartButtons.forEach((button) => {
  // Agrega un event listener para el evento 'click' en cada botón
  button.addEventListener('click', async () => {
    try {
      // Encuentra el elemento padre más cercano con la clase 'card' al botón actual.
      const card = button.closest('.card');
      // Encuentra el elemento con la clase 'card-id' dentro de la tarjeta y obtiene su contenido de texto. 
      const productID = card.querySelector('.card-id').textContent.replace('PID: ', '').trim();
      //obtenemos el id del carrito
      const cartID = document.getElementById('cart-id').textContent.trim();
    

      // Primero, verifica si el producto está en stock
      const response = await fetch(`/api/products/${productID}`);
      const productData = await response.json();


      if (productData.payload.stock > 0) {
        // Si el producto está en stock, realiza una solicitud (POST) a una API para agregar un producto al carrito.
        const response = await fetch(`/api/carts/${cartID}/product/${productID}`, {
          method: 'POST',
        });
        const data = await response.json();
        console.log(data);

        // Muestra una notificación de Toastify
        Toastify({
          text: "Producto agregado al carrito",
          duration: 1000,
          close: true,
          gravity: "top", // `top` or `bottom`
          position: 'right', // `left`, `center` or `right`
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();

      } else {  
        // Si el producto no está en stock, muestra una notificación de Toastify
        Toastify({
          text: "El producto no está en stock",
          duration: 1000,
          close: true,
          gravity: "top", // `top` or `bottom`
          position: 'right', // `left`, `center` or `right`
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

document.getElementById('resetButton').addEventListener('click', function() {
  document.getElementById('productForm').reset();
  location.reload();
});