const express = require ('express');
const multer = require ('multer');
const ejs = require ('ejs');
const path = require ('path');


// Set Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        
    }

});

//init upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
    }).single('myImg');

//check file type
function checkFileType(file, cb) {
    //Allow ext
    const filetypes = /jpeg|jpg|png|gif/;
    //check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // check the mime type
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb('Error: Images Only!');
    }
}

// init app
const app = express();


// EJS
app.set('view engine', 'ejs');

//Public folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
        res.render('index', {
           msg:err 
        });
    } else{
       if(req.file == undefined){
           res.render('index',{
            msg: 'Error no file selected!'
           });
       } else{
           res.render('index', {
               msg: 'File uploaded!',
               file: `uploads/${req.file.filename}`
           });
       }
    }
  });
});

const port = 3000;

app.listen(port, () => console.log('Server started on port ${port}'));