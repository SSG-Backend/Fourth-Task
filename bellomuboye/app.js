const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const fs = require("fs");
const path = require("path");
require("dotenv/config");
const multer = require("multer");
const imgModel = require("./model");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL, 
	{useNewUrlParser: true, useUnifiedTopology: true}, 
	err => {
		console.log("Connected to MongoDB Database")
	}
);



var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads")
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '_' + Date.now());
	}
});
var upload = multer({storage: storage});

app.get("/", (req, res) => {
	imgModel.find({}, (err, items) => {
		if (err) {
			console.log(err);
		} else {
			res.render("app", {items: items});
		}
	});
});

app.post("/", upload.single("image"), (req, res, next) => {
	var imageTypeRegularExpression = /\/(.*?)$/;
	var imageType = req.file.mimetype.match(imageTypeRegularExpression);
	var fileType = imageType[1];
	var obj = {
		name: req.body.name,
		desc: req.body.desc,
		img: {
			data: fs.readFileSync(path.join(__dirname + "/" + req.file.path)),
		},
		filename: req.file.filename,
		filetype: fileType
	}
	imgModel.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		} else {
			item.save().then(img => {
				imgModel.findById(img._id, (err, foundImage) => {
					if (err) {
						console.log(err);
					} else {
						fs.writeFileSync(__dirname + "/public/img/" + foundImage.filename + "." + foundImage.filetype, foundImage.img.data)
					}
				});
			});
			res.redirect("/#uploaded-images");
		}
	});
});

let port = process.env.PORT || "3000";

app.listen(port, err => {
	if (err) {
		console.log(err);
	} else {
		console.log("Server started at Port " + port)
	}
})