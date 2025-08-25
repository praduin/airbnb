const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");

const {
  getAddHome,
  getData,
  gethosthome,
  getEditHome,
  postEditHome,
  deletehomewithid,
} = require("../controllers/fhome");

router.get("/add-home", getAddHome);
router.post("/add-home", upload.single("houseImages"), getData);

router.get("/hosthome", gethosthome);

router.get("/edit-home/:homeId", getEditHome);
router.post("/edit-home/:homeId", upload.single("houseImages"), postEditHome);
router.post("/delete-home/:homeId", deletehomewithid);

module.exports = router;
