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
          <h5>Id: ${product._id}</h5>
        </div>
        <div>
          <p>${product.description}</p>
        </div>
        <div>
          <h5>Precio: ${product.price} USD</h5>
          <h5>stock: ${product.stock}</h5>
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

//#AGREGAR UN PRODUCTO
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
  alert('Producto Agregado Correctamente')
  form.reset(); // Restablecer los campos del formulario
});


//#ACTUALIZAR UN PRODUCTO
// Obtener referencia al formulario y agregar un evento para cuando se envíe
let updateForm = document.getElementById("updateForm");
updateForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Evitar que el formulario recargue la página

  // Obtener valores de los campos del formulario
  let _id = updateForm.elements.productID.value
  let title = updateForm.elements.title.value;
  let description = updateForm.elements.description.value;
  let stock = updateForm.elements.stock.value;
  let thumbnail = updateForm.elements.thumbnail.value;
  let price = updateForm.elements.price.value;
  let code = updateForm.elements.code.value;
  let category = updateForm.elements.category.value;

  // Crear un objeto solo con las propiedades definidas
  let productData = {};
  if (_id) productData._id = _id;
  if (title) productData.title = title;
  if (description) productData.description = description;
  if (stock) productData.stock = stock;
  if (thumbnail) productData.thumbnail = thumbnail;
  if (price) productData.price = price;
  if (code) productData.code = code;
  if (category) productData.category = category;

  // Emitir un evento "updateProduct" al servidor con la información del producto
  socketCliente.emit("updateProduct", productData);

  alert('Producto Actualizado')
  updateForm.reset(); // Restablecer los campos del formulario
});


//#DELETE PRODUCT
// Obtener referencia al botón de eliminación
const deleteButton =  document.getElementById('delete-btn');

// Agregar un evento para cuando se haga clic en el botón de eliminación
deleteButton.addEventListener('click', () => {
  const idInput = document.getElementById('productID-delete'); // obtenemos el input donde se ingresa el id
  console.log(idInput.value)
  //const productID = parseInt(idInput.value); //convertimos el valor del input a entero
  const productID = idInput.value
  //enviamos el valor al servidor
  socketCliente.emit('deleteProduct' , productID);
  alert('Producto eliminado correctamente!')
  idInput.value = "" // Restablecer el valor del input

})

//Escuchar eventos "updatedProducts" enviados por el servidor después de una actualización

socketCliente.on("updatedProducts", (obj) => {
  updateProductList(obj); // Llama a la función para actualizar la lista de productos en la página
});