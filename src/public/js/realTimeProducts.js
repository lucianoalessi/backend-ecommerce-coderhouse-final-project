// Crear una instancia de socket.io cliente
const socketCliente = io();

// Escuchar eventos "productos" enviados por el servidor, en el cual recibiremos la lista de productos actualizada. 

socketCliente.on("productos", (products) => {
  console.log(products);
  updateProductList(products);
});


// Función para actualizar la lista de productos en la página web en 'localhost:8080/realtimeproducts'

const updateProductList = (products) => {
  let productListContainer = document.getElementById("products-list-container");
  let productsList = "";

  // Itera a través de la lista de productos y crea una tarjeta HTML para cada uno
  products.forEach((product) => {
    productsList += `
    
    <div class="card">
      <div class="card-content">
        <h4>${product.title}</h4>
        <div>
          <h5>Id: ${product.id}</h5>
        </div>
        <div>
          <p>${product.description}</p>
        </div>
        <div>
          <h5>Precio: ${product.price} USD</h5>
        </div>
        <div>
          <a href="#">Buy Now</a>
        </div>
      </div>
    </div>`;
  });

  // Actualiza el contenido del contenedor de la lista de productos en la página.
  productListContainer.innerHTML = productsList;
}

// Obtener referencia al formulario y agregar un evento para cuando se envíe
let form = document.getElementById("formProduct");
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Evitar que el formulario recargue la página

  // Obtener valores de los campos del formulario
  let title = form.elements.title.value;
  let description = form.elements.description.value;
  let stock = form.elements.stock.value;
  let thumbnail = form.elements.thumbnail.value;
  let price = form.elements.price.value;
  let code = form.elements.code.value;
  let category = form.elements.category.value;

  // Emitir un evento "addProduct" al servidor con la información del nuevo producto
  socketCliente.emit("addProduct", {
    title,
    description,
    stock,
    thumbnail,
    price,
    code,
    category,
  });

  form.reset(); // Restablecer los campos del formulario
});


// Obtener referencia al botón de eliminación
const deleteButton =  document.getElementById('delete-btn');

// Agregar un evento para cuando se haga clic en el botón de eliminación
deleteButton.addEventListener('click', () => {
  const idInput = document.getElementById('productID'); // obtenemos el input donde se ingresa el id
  //const productID = parseInt(idInput.value); //convertimos el valor del input a entero
  const productID = idInput.value
  //enviamos el valor al servidor
  socketCliente.emit('deleteProduct' , productID);
  idInput.value = "" // Restablecer el valor del input

})

//Escuchar eventos "updatedProducts" enviados por el servidor después de una actualización

socketCliente.on("updatedProducts", (obj) => {
  updateProductList(obj); // Llama a la función para actualizar la lista de productos en la página
});