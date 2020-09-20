var createError = require('http-errors');
var express = require('express');
var path = require('path');
let crypto = require('crypto');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');
let multer = require('multer');
let GridFsStorage = require('multer-gridfs-storage');

let fs = require('fs');

// Temporarily initialize gfs variable
let gfs = null;

// DB
//let mongoURI = "mongodb://localhost:27017/acme";
let mongoURI = "mongodb+srv://dammy:t7Wa5Av4Ge@imguploader.f2kig.mongodb.net/imageUpload?retryWrites=true&w=majority";

// Connecting to the database
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}, err => {console.log('connected')
});
const conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', function() {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});


// Storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {   // redundant method
        if (err) {
          return reject(err);
        }
        // const filename = buf.toString("hex") + path.extname(file.originalname);
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      }); 
    });
  }
});

// const storage = new GridFsStorage({ url : mongoURI})

const upload = multer({
  storage
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/* app.use('/public/images/', express.static('./public/images')); */

app.get('/', function(req, res) {
  		res.render('index'); 
});

app.post("/upload", upload.single("file"), function(req, res) {
  res.redirect("/");
});


app.get('/uploaded', function(req, res) {
  if(!gfs) {
    console.log("some error occured, check connection to db");
    res.send("some error occured, check connection to db");
    process.exit(0);
  }


  let transfer = gfs.find().toArray((err, files) => {
  /* gfs.find().toArray((err, files) => { */
    var filtered = null;


    // check if files
    if (!files || files.length === 0) {
      res.render("uploaded", {
        files: false
      });
    } else {
        filtered = files.map(file => {
          if (
            file.contentType === "image/png" ||
            file.contentType === "image/jpeg"
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
          return file;
        }).sort((a, b) => {
          return (
            new Date(b["uploadDate"]).getTime() -
            new Date(a["uploadDate"]).getTime()
          );
        });

        let desiredNumber = filtered.length;
        let loadingComplete = desiredNumber-1;

        for (let index = 0; index < desiredNumber; index++) {

          gfs.openDownloadStreamByName(filtered[index].filename).
          pipe(fs.createWriteStream(path.join(__dirname, 'public', 'images', filtered[index].filename))).
          on('error', function(error) {
            assert.ifError(error);
          }).
          on('finish', function() {
            console.log('done!');
            if(index === loadingComplete) {
              res.render('uploaded', {
                files: filtered
              });
            }
          });
          
        }
    }
  })
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
