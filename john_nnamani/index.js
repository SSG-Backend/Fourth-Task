const express = require('express');
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/';
const dbname = 'imageUpload';

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.post('/upload', upload.single('photo'), (req, res) => {
    if(req.file) {
        MongoClient.connect(url, (err, client) => {

            assert.equal(err,null);

            console.log('Connected correctly to server');

            const db = client.db(dbname);
            const collection = db.collection("images");
            collection.insertOne(req.file,
                (err, result) => {
                    assert.equal(err,null);

                    console.log("After Insert:\n");
                    console.log(result.ops);
                    client.close();
                    res.end('<html><body><h1>Image has been added successfully</h1></body></html>');
                });

        });
    }
    else throw 'error';
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});