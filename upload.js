const multer = require("multer");

const storage = multer.memoryStorage();

// File filter function to check weather the file is image or not
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
