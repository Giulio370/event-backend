const multer = require('multer');
const { storage } = require('../utils/cloudinary');

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
