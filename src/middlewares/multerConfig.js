
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = 'documents'; // Por defecto, guarda en 'documents'
    if (file.fieldname === 'profile') path = 'profiles';
    if (file.fieldname === 'product') path = 'products';
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage });

export default upload;
