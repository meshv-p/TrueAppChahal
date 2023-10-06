const fs = require("fs");

const fileRemover = (req, res, next) => {
  const directory = "./uploads";
  // Read all files in the uploads directory

  console.log("File will remove");
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    // check if there is any file in uploads folder
    if (files.length === 0) {
      console.log("No files found in the folder.");
      next();
      //   return res.json({ error: "No files found in the folder." });
    }

    for (const file of files) {
      fs.unlink(`${directory}/${file}`, (err) => {
        console.log("file", file);
        if (err) throw err;
      });
    }
    next();
  });
};

module.exports = fileRemover;
