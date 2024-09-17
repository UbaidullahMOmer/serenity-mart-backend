const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
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
    folder: "serenity-mart/products",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "tiff", "bmp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

const upload = multer({ storage: storage }).single("image");

const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "-createdAt", category, minPrice, maxPrice } = req.query;
  const filter = {}; 
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  try {
    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      totalProducts: count,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

const createProduct = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { name, price, description, category, discount = 0, isInStock = true } = req.body;

    if (!name || !price || !description || !category || !req.file) {
      return res.status(400).json({ message: "Please provide all required fields and an image" });
    }

    try {
      const discountPrice = discount ? (price - (price * discount) / 100).toFixed(2) : price;

      const product = await Product.create({
        name,
        price,
        discountPrice,
        image: req.file.path,
        description,
        discount,
        category,
        isInStock,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error in createProduct:", error);
      res.status(500).json({ message: "Failed to create product", error: error.message });
    }
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { id } = req.params;
    const { name, price, description, category, discount, isInStock } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    try {
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update fields if provided
      if (name) product.name = name;
      if (price) product.price = price;
      if (description) product.description = description;
      if (category) product.category = category;
      if (isInStock !== undefined) product.isInStock = isInStock;
      if (discount !== undefined) product.discount = discount;

      product.discountPrice = product.discount
        ? (product.price - (product.price * product.discount) / 100).toFixed(2)
        : product.price.toFixed(2);

      if (req.file) {
        // Delete old image from Cloudinary if it exists
        if (product.image) {
          const publicId = product.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
        product.image = req.file.path;
      }

      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error in updateProduct:", error);
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: "Validation failed", errors: validationErrors });
      }
      res.status(500).json({ message: "Failed to update product", error: error.message });
    }
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error in getProduct:", error);
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the associated image from Cloudinary
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Product.deleteOne({ _id: id });
    res.status(200).json({ message: "Product removed", id: id });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
});

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};