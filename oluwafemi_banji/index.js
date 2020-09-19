const express = require("express")
const app = express()

const multer = require("multer")
const path = require("path")
const GridFsStorage = require("multer-gridfs-storage")
const crypto = require("crypto")
const mongoose = require("mongoose")

// middleware

app.use(express.json())
app.set("view engine", "ejs")

app.get("/", (req, res) => {
  res.render("./index")
})

const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`server started on port ${port}`)
})

//DATABASE URI
const mongoURI = "mongodb://localhost:27017/my_database"

//create mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParse: true,
  useUnifiedTopology: true
})

//init gfs
let gfs
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  })
})

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  fileName: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err)
        }
        const fileName = buf.toString("hex") + path.extname(file.orginalname)
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        }
        resolve(fileInfo)
      })
    })
  }
})
const upload = multer({
  storage
})

app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/")
})

app.get("/image/:filename", (req, res) => {
  // console.log('id', req.params.id)
  const file = gfs
    .find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        })
      }
      gfs.openDownloadStreamByName(req.params.filename).pipe(res)
    })
})

app.get("/", (req, res) => {
  if (!gfs) {
    console.log("some error occured, check connection to db")
    res.send("some error occured, check connection to db")
    process.exit(0)
  }
  gfs.find().toArray((err, files) => {
    // check if files
    if (!files || files.length === 0) {
      return res.render("index", {
        files: false
      })
    } else {
      const f = files
        .map((file) => {
          if (
            file.contentType === "image/png" ||
            file.contentType === "image/jpeg"
          ) {
            file.isImage = true
          } else {
            file.isImage = false
          }
          return file
        })
        .sort((a, b) => {
          return (
            new Date(b["uploadDate"]).getTime() -
            new Date(a["uploadDate"]).getTime()
          )
        })

      return res.render("index", {
        files: f
      })
    }
  })
})
// files/del/:id
// Delete chunks from the db
app.post("/files/del/:id", (req, res) => {
  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
    if (err) return res.status(404).json({ err: err.message })
    res.redirect("/")
  })
})
