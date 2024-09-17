const asyncHandler = require("express-async-handler");
const Deal = require("../models/dealModel");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "serenity-mart/deals",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "tiff", "bmp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

const upload = multer({ storage: storage }).single("image");

const getDeals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "-createdAt", category, minPrice, maxPrice } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  try {
    const count = await Deal.countDocuments(filter);
    const deals = await Deal.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      deals,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      totalDeals: count,
    });
  } catch (error) {
    console.error("Error in getDeals:", error);
    res.status(500).json({ message: "Failed to fetch deals", error: error.message });
  }
});

const createDeal = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { name, price, description, category, discount = 0, isInStock = false } = req.body;

    if (!name || !price || !description || !category || !req.file) {
      return res.status(400).json({ message: "Please provide all required fields and an image" });
    }

    try {
      const discountPrice = discount ? (price - (price * discount) / 100).toFixed(2) : price;

      const deal = await Deal.create({
        name,
        price,
        discountPrice,
        image: req.file.path,
        description,
        discount,
        category,
        isInStock,
      });

      res.status(201).json(deal);
    } catch (error) {
      console.error("Error in createDeal:", error);
      res.status(500).json({ message: "Failed to create deal", error: error.message });
    }
  });
});

const updateDeal = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { id } = req.params;
    const { name, price, description, category, discount, isInStock } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Deal ID is required" });
    }

    try {
      const deal = await Deal.findById(id);

      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      if (name) deal.name = name;
      if (price) deal.price = price;
      if (description) deal.description = description;
      if (category) deal.category = category;
      if (isInStock !== undefined) deal.isInStock = isInStock;
      if (discount !== undefined) deal.discount = discount;

      deal.discountPrice = deal.discount
        ? (deal.price - (deal.price * deal.discount) / 100).toFixed(2)
        : deal.price.toFixed(2);

      if (req.file) {
        if (deal.image) {
          const publicId = deal.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        deal.image = req.file.path;
      }

      const updatedDeal = await deal.save();
      res.status(200).json(updatedDeal);
    } catch (error) {
      console.error("Error in updateDeal:", error);
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: "Validation failed", errors: validationErrors });
      }
      res.status(500).json({ message: "Failed to update deal", error: error.message });
    }
  });
});

const getDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Deal ID is required" });
  }

  try {
    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }
    res.status(200).json(deal);
  } catch (error) {
    console.error("Error in getDeal:", error);
    res.status(500).json({ message: "Failed to fetch deal", error: error.message });
  }
});

const deleteDeal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Deal ID is required" });
  }

  try {
    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    if (deal.image) {
      const publicId = deal.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Deal.deleteOne({ _id: id });
    res.status(200).json({ message: "Deal removed", id: id });
  } catch (error) {
    console.error("Error in deleteDeal:", error);
    res.status(500).json({ message: "Failed to delete deal", error: error.message });
  }
});

module.exports = {
  getDeals,
  createDeal,
  updateDeal,
  getDeal,
  deleteDeal,
};