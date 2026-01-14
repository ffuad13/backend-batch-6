const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Helper to generate a unique filename
const generateFilename = (file) => {
  const ext =
    path.extname(file.originalname) || '.' + file.mimetype.split('/')[1];
  const basename = crypto.randomBytes(16).toString('hex');
  return basename + ext;
};

const storageFactory = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, generateFilename(file));
    },
  });

const uploadProduct = multer({ storage: storageFactory('upload/product/') });
const uploadUser = multer({ storage: storageFactory('upload/user/') });

module.exports = { uploadProduct, uploadUser };
