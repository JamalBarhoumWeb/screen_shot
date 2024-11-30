const express = require("express");
// const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use(cors());

const getpdfRouter = require("./routers/pdf")


app.use("/download", getpdfRouter);



// http://localhost:3000/download/pdf?url=<PDF_URL>

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});