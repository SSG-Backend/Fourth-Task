const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
	name: String,
	desc: String,
	img: {
		data: Buffer,
		contentType: String
	},
	filename: String,
	filetype: String
});

module.exports = new mongoose.model("Image", imageSchema);