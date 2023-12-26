document.getElementById('uploadForm').addEventListener('submit', function(event) {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
      event.preventDefault();  // Evita que se envíe el formulario
      fileInput.classList.add('is-invalid');
    } else {
      fileInput.classList.remove('is-invalid');
      // Añade una alerta después de que los archivos se hayan subido correctamente
      alert('Los archivos se han subido correctamente.');
    }
  });