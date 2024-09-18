const asyncHandler = require("express-async-handler");
const Hero = require("../models/heroModel.js");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({ 
  cloud_name: "daqzyx2uv",
  api_key: "645274696555577",
  api_secret: "TtGTW3BvC4wcyOSFwrrTWGRmRsY"
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "serenity-mart/hero",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "tiff", "bmp"],
    transformation: [{ width: 1980, height: 1080, crop: "limit" }],
  },
});
 
const upload = multer({ storage: storage }).single("image");

const getHero = asyncHandler(async (req, res) => {
  const hero = await Hero.findOneOrCreate();
  res.status(200).json(hero);
});

const updateHero = asyncHandler(async (req, res) => {
  try {   
    const hero = await Hero.findOneOrCreate();

    hero.title = req.body.title || hero.title;
    hero.description = req.body.description || hero.description;

    const updatedHero = await hero.save();

    res.status(200).json(updatedHero);

  } catch (error) {
    console.error("Error in updateHero:", error);
    res.status(500).json({ message: "Failed to update hero", error: error.message });
  }
});

const addImage = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {   
      const hero = await Hero.findOneOrCreate();
        
      if (req.file) {
        hero.images.push(req.file.path);
      } else {
        return res.status(400).json({ message: "No image file provided" });
      }

      const updatedHero = await hero.save();

      res.status(200).json(updatedHero);

    } catch (error) {
      console.error("Error in addImage:", error);
      res.status(500).json({ message: "Failed to add image", error: error.message });
    }
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const { imageIndex } = req.params;

  if (!imageIndex) {
    return res.status(400).json({ message: "Image index is required" });
  }

  try {   
    const hero = await Hero.findOneOrCreate();

    if (imageIndex >= 0 && imageIndex < hero.images.length) {
      const imageUrl = hero.images[imageIndex];
      
      // Delete image from Cloudinary
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);

      // Remove image from hero.images array
      hero.images.splice(imageIndex, 1);
      
      const updatedHero = await hero.save();
      res.status(200).json(updatedHero);
    } else {
      res.status(400).json({ message: "Invalid image index" });
    }

  } catch (error) {
    console.error("Error in deleteImage:", error);
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
});

module.exports = {
  getHero,
  updateHero,
  addImage,
  deleteImage
};