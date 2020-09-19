const upload = require('../middleware/upload');

const uploadFile = async (req, res) => {
    try {
      await upload(req, res);
  
      console.log(req.file);
      if (req.file == undefined) {
        return res.render("select");
      }
  
      return res.render("success");
    } catch (error) {
      console.log(error);
      return res.render("failure");
    }
};

module.exports = uploadFile;
