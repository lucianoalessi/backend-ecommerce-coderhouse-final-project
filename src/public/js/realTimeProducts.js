// Obtener referencia con datos del usuario
let userId = document.getElementById('user-id').textContent;
let userRole = document.getElementById('user-role').textContent;

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
  let productsList = '<div class="row">'; // Inicia una nueva fila

  // Itera a través de la lista de productos y crea una tarjeta HTML para cada uno
  products.forEach((product) => {
    productsList += `
      <div class="col-md-4 mb-4"> <!-- Cada producto ocupará 4 columnas en dispositivos medianos y grandes -->
        <div class="card h-100 shadow-sm"> <!-- Añade sombra a la tarjeta -->
          <div class="card-body">
              <img src="${product.thumbnail}" class="card-img-top img-fluid" alt="${product.title}" style="object-fit: contain; height: 100px;margin-bottom: 20px;">
              <h6 class="card-title"><strong>${product.title}</strong></h6>
              <p class="card-text">${product.description}</p>
              <div class="row">
                <h6 class="card-text">Precio: <strong>${product.price} USD</strong></h6>
                <h6 class="card-text">Stock: ${product.stock}</h6>
                <h6 class="card-text">Categoria: ${product.category}</h6>
              </div>
          </div>
          <div class="card-footer">
            <h7 class="card-subtitle mb-2 text-muted">Product ID: ${product._id}</h7>
            <br>
            <h7 class="card-text">Owner: ${product.owner}</h7>
          </div>
        </div>
      </div>`; // Cierra la columna del producto
  });

  productsList += '</div>'; // Cierra la fila

  // Actualiza el contenido del contenedor de la lista de productos en la página.
  productListContainer.innerHTML = productsList;
}

//#AGREGAR UN PRODUCTO
// Obtener referencia al formulario y agregar un evento para cuando se envíe
let form = document.getElementById("formProduct");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Evitar que el formulario recargue la página

  // Crear un objeto FormData y agregar todos los campos del formulario
  let formData = new FormData(form);

  // // Obtener valores de los campos del formulario
  // let title = form.elements.title.value;
  // let description = form.elements.description.value;
  // let category = form.elements.category.value;
  // let price = form.elements.price.value;
  // let stock = form.elements.stock.value;
  // let code = form.elements.code.value;
  // //let thumbnail = form.elements.thumbnail.value;
  
  
  // const product = {
  //   title,
  //   description,
  //   category,
  //   price,
  //   stock,
  //   code,
  //   //thumbnail,   
  // }

  try {
    // Crear una solicitud POST
    const response = await fetch('/api/products', {
      method: 'POST',
      body: formData, // Enviar los datos del formulario como FormData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const product = await response.json(); // Obtener el producto de la respuesta

    if (response.status == 201) {
      socketCliente.emit('addProduct' , {product , userId , userRole});
      alert('Producto Agregado Correctamente');
      form.reset(); // Restablecer los campos del formulario
    } else {
      alert('Error al agregar el producto.');
    }

  } catch (error) {
    console.error('Error:', error);
  }

  // // Emitir un evento "addProduct" al servidor con la información del nuevo producto
  // socketCliente.emit("addProduct", {product , userId , userRole});
});

// // Escuchar el evento de producto agregado
// socketCliente.on('productAdded', () => {
//   alert('Producto Agregado Correctamente');
//   form.reset(); // Restablecer los campos del formulario
// });



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

  // Crear un objeto con los datos del usuario
  let userData = {
    _id: userId,
    role: userRole
  }

  // Emitir un evento "updateProduct" al servidor con la información del producto y del usuario
  socketCliente.emit("updateProduct", productData , userData);
});


// Escuchar el evento de producto actualizado
socketCliente.on('productUpdated', () => {
  alert('Producto Actualizado');
  updateForm.reset(); // Restablecer los campos del formulario
});


//#DELETE PRODUCT
// Obtener referencia al botón de eliminación
const deleteButton =  document.getElementById('delete-btn');

// Agregar un evento para cuando se haga clic en el botón de eliminación
deleteButton.addEventListener('click', async () => {

  // obtenemos el input donde se ingresa el id
  let productId = document.getElementById('productID-delete').value;

  // Crear un objeto con los datos del usuario
  let userData = {
    _id: userId,
    role: userRole
  } 

  try {
    // Crear una solicitud DELETE
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    console.log(response)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    if (response.status == 204) {
      socketCliente.emit('deleteProduct' , productId , userData);
      alert('Producto eliminado correctamente!');
      document.getElementById('productID-delete').value = ""; // Restablecer el valor del input 
    } else {
      alert('Error al eliminar el producto.');
    }

  } catch (error) {
    console.error('Error:', error);
  }

});






// // Obtener referencia al botón de eliminación
// const deleteButton =  document.getElementById('delete-btn');

// // Agregar un evento para cuando se haga clic en el botón de eliminación
// deleteButton.addEventListener('click', () => {

//   // obtenemos el input donde se ingresa el id
//   const productId = document.getElementById('productID-delete').value;
//   // Crear un objeto con los datos del usuario
//   let userData = {
//     _id: userId,
//     role: userRole
//   } 
//   //enviamos el valor al servidor
//   socketCliente.emit('deleteProduct' , productId , userData);
//   productId = "" // Restablecer el valor del input 
// });

// Escuchar el evento de producto eliminado
// socketCliente.on('productDeleted', () => {
//   alert('Producto eliminado correctamente!');
// });


//ALERTAS DE ERRORES:

  socketCliente.on('error', (errorMessage) => {
    alert(errorMessage);
  });



//Escuchar eventos "updatedProducts" enviados por el servidor después de una actualización

socketCliente.on("updatedProducts", (obj) => {
  updateProductList(obj); // Llama a la función para actualizar la lista de productos en la página
});