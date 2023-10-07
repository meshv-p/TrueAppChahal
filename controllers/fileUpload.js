const fs = require("fs").promises;
const fs1 = require("fs");
const csv = require("csv-parser");

async function getFile(folderPath) {
  try {
    const files = await fs.readdir(folderPath);

    if (files.length > 0) {
      return files[0];
    } else {
      console.error("No files found in the folder.");
      return null;
    }
  } catch (err) {
    console.error("Error reading folder:", err);
    throw err;
  }

  // let file = await fs.readdir(folderPath, (err, files) => {
  //   if (err) {
  //     console.error("Error reading folder:", err);
  //     return;
  //   }

  //   // return first file
  //   // callback(null, files[0]);
  //   return files[0];
  // });
  // return file;
}

//  file upload
const readFile = async (req, res) => {
  try {
    console.log(req.query.page, "page");

    const folderPath = "./uploads"; // Replace with your folder path
    const file = await getFile(folderPath);

    if (!file) {
      console.log("No files found in the folder.");
      return res.json({ error: "No files found in the folder." });
    }

    console.log("First file:", file);

    const csvFilePath = `${folderPath}/${file}`; // Replace with your CSV file path
    console.log(csvFilePath, "csvFilePath");

    const page = parseInt(req.query.page) || 1;
    const offset = parseInt(req.query.offset) || 10;
    console.log(page, "page");

    const itemsPerPage = offset;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    console.log(endIndex, "edIdx");
    const pageData = [];

    const readStream = fs1.createReadStream(csvFilePath);

    readStream
      // .pipe(csv({ headers: false, delimiter: "," }))
      .pipe(csv())

      .on("data", (row) => {
        // Assuming the CSV file contains a "number" column
        const number = parseInt(row["CON NO."] || row["0"]);
        // console.log(row);
        // if (!isNaN(number)) {
        pageData.push(number);
        // }
      })
      .on("end", () => {
        const totalPages = Math.ceil(pageData.length / itemsPerPage);
        // console.log(totalPages, pageData, itemsPerPage, "tt");

        if (page < 1 || page > totalPages) {
          return res.status(400).json({ error: "Invalid page number." });
        }

        const pageNumbers = pageData.slice(startIndex, endIndex);

        console.log(page, "firstFile");
        res.json({
          page,
          totalPages,
          data: pageNumbers,
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  readFile,
};
