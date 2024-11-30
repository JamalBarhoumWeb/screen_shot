const express = require("express");
// const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// app.use(cors());

const getpdfRouter = require("./routers/pdf")


app.use("/download", getpdfRouter);

app.use("*", (req,res)=>{
  res.status(404).json("No content at this path")
})

// http://localhost:3000/download/pdf?url=<PDF_URL>

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});