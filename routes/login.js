const express = require("express");
const multer = require("multer");

const log = require("../controllers/fhome");
const app = express();
app.use(express.urlencoded({ extended: false }));
const logi = express.Router();
console.log("login router loaded");
logi.get("/userlogin", log.getLogin);
logi.post("/logindone", log.logindones);
logi.get("/logout", log.logout);
logi.post("/logout", log.postlogout);
module.exports = logi;
