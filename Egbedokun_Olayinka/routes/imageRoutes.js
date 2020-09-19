const express = require("express");
const router = express.Router();

const uploadFile = require('../controllers/imageController');

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/upload", uploadFile);

module.exports = router;
