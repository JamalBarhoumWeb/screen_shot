const express = require("express");
const getpdfRouter = express.Router();
const {
    downloadPdf,
} = require("../conterollers/downloadPdf");
const {downloadImage} = require("../conterollers/screenshot.js")

getpdfRouter.get("/pdf", downloadPdf);
getpdfRouter.get("/Image", downloadImage);




module.exports = getpdfRouter;