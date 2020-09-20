const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// Mongo URI
const mongoURI =
  "mongodb+srv://Abeeb:3TL4CbYO5sOLH4td@cluster0.ijpa4.mongodb.net/ssg-backend?retryWrites=true&w=majority";

// Mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParse: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Initialise stream
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

// @route -> loads the form
app.get("/", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      res.render("index", { files: false });
    } else {
      files.map((file) => {
        if (
          file.contentType === "image/jpeg" ||
          file.contentType === "image/png"
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render("index", { files: files });
    }
  });
});

// @post -> upload to db
app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/");
});

// @route -> get all files from the db
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({ err: "No files found in the database" });
    }
    return res.json(files);
  });
});

// @route -> get image from the db
app.get("/file/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ err: "No file found in the db" });
    }
    return res.json(file);
  });
});

// @route -> get file name from the db
app.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ err: "No image found in the db" });
    }
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read and display the file
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: "File not an image" });
    }
  });
});

// @route delete/:id -> delete file from the db
app.delete("/files/:id", (req, res) => {
  gfs.remove({ _id: req.params.id, root: "uploads" }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }
    res.redirect("/");
  });
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
