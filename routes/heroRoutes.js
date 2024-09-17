const express = require("express");
const router = express.Router();

const {
  getHero,
  updateHero,
  addImage,
  deleteImage
} = require("../controllers/heroControllers");

router.get("/", getHero);

router.put("/", updateHero);

router.post("/image", addImage);

router.delete("/image/:imageIndex", deleteImage);

module.exports = router;