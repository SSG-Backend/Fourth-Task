const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path');
const util = require("util");


const dotenv = require('dotenv');
dotenv.config({ path: '../config/config.env' });

var storage = new GridFsStorage({
  url: "mongodb+srv://Olayinka:Frankenstein@cluster0.7seiw.mongodb.net/image-store?retryWrites=true&w=majority",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-file-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-file-${file.originalname}`
    };
  }
});

var uploadFile = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = uploadFilesMiddleware;