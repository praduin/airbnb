const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const {
  getAddHome,
  getData,
  gethosthome,
  getEditHome,
  postEditHome,
  deletehomewithid,
} = require("../controllers/fhome");

router.get("/add-home", getAddHome);
router.post("/add-home", upload.single("houseImage"), getData);

router.get("/hosthome", gethosthome);

router.get("/edit-home/:homeId", getEditHome);
router.post("/edit-home/:homeId", upload.single("houseImage"), postEditHome);
router.post("/delete-home/:homeId", deletehomewithid);

module.exports = router;
