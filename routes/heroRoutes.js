const express = require("express");
const router = express.Router();

const {
  getHero,
  updateHero,
  addImage,
  deleteImage
} = require("../controllers/heroControllers");

// Get hero
router.get("/", getHero);

// Update hero title and description
router.put("/", updateHero);

// Add image to hero
router.post("/image", addImage);

// Delete image from hero
router.delete("/image/:imageIndex", deleteImage);

module.exports = router;