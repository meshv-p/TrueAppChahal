const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { readFile } = require("./controllers/fileUpload");
const fileRemover = require("./controllers/fileRemover");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Set up the middleware for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Serve the HTML form for file upload
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle file upload
app.post("/upload", fileRemover, upload.single("file"), (req, res) => {
  // before uploading new file remove all files from uploads folder
  res.send(`
      <h3>File uploaded successfully!</h3>

        <a href="/">Go Back</a>
        <a href="/data?page=1">See Apis</a>

  `);
});

app.get(`/data`, readFile);

app.post("/data1?", (req, res) => {
  // Check if CSV data was provided in the request body
  const { csvData } = req.body;

  if (!csvData) {
    return res.status(400).json({ error: "CSV data is required" });
  }

  // Decode the base64-encoded CSV data
  const decodedCsvData = Buffer.from(csvData, "base64").toString("utf8");

  // Now, you can parse the CSV data and perform further processing
  // ...
  // Now, you can parse and process the CSV data
  // Parse the CSV data and extract numbers
  const numbers = [];

  csv({ headers: false, delimiter: "," }) // Adjust delimiter as needed
    .on("data", (row) => {
      const numericValue = parseInt(row[0], 10); // Assuming the numbers are in the first column (index 0)

      if (!isNaN(numericValue)) {
        numbers.push(numericValue);
      }
    })
    .on("end", () => {
      // Divide the numbers into pages (100 numbers per page)
      const rowsPerPage = 100;
      const totalPages = Math.ceil(numbers.length / rowsPerPage);
      const paginatedNumbers = [];

      for (let page = 1; page <= totalPages; page++) {
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const pageNumbers = numbers.slice(startIndex, endIndex);
        paginatedNumbers.push(pageNumbers);
      }

      res.json({ totalPages, pages: paginatedNumbers });
    })
    .on("error", (error) => {
      console.error("CSV parsing error:", error);
      res.status(500).json({ error: "Error parsing CSV data" });
    })
    .write(decodedCsvData);

  console.log(numbers, "results");
  console.log(numbers.length, "results");

  res.json({ message: "CSV data uploaded and processed successfully" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
