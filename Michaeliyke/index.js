const hostname = "127.0.0.1";
const port = 3000;
const express = require("express");
const upload = require("express-fileupload");

const app = express();
const knex = require("knex")({
  client: "sqlite3",
  useNullAsDefault: true,
  connection: {
    filename: "./sqlite3/Node-starter.sqlite"
  }
});

app.use(upload());

app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/index.html`);
});

// POST
app.post("/", async (request, response) => {
  const files = request.files;

  if (!files) {
    response.status(404).send("<h1>File not found</h1>");
    return
  }

  console.log(`Upload of ${files.photograph.name} received!`);

  await knex.insert({
    name: files.photograph.name,
    image: files.photograph.data //The actual binary buffer
  }).into("images");

  files.photograph.mv(`./uploads/${files.photograph.name}`, async (error) => {
    if (error) {
      console.log("Upload failed: Internal server error.");
      response.status(500).send("<h1>Upload failed: Internal server error</h1>");
      return
    } else {
      console.log("File successfully ploaded!");
      response.status(200).send("<h1>File successfully ploaded!</h1>");
    }
  });
});


app.listen(port, "127.0.0.1", () => {
  console.log(`Sever running at http://${hostname}:${port}`);
});