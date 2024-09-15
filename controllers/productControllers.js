const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const multer = require("multer");
const path = require("path");
const fs = require('fs').promises;

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/products')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|svg|tiff|bmp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
}).single("image");

const getProducts = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "-createdAt";
    const filter = {};

    if (req.query.category) filter.category = req.query.category;
    if (req.query.minPrice)
      filter.price = { $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice)
      filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalProducts: count,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
});

const createProduct = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    const { name, price, description, category, discount, isInStock } = req.body;

    if (!name || !price || !description || !category) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please provide an image file" });
    }

    try {
      const imageUrl = `https://serenity-mart-backend.vercel.app//images/products/${req.file.filename}`;
      const discountPrice = discount
        ? (price - (price * discount) / 100).toFixed(2)
        : price.toFixed(2);

      const product = await Product.create({
        name,
        price,
        discountPrice,
        image: imageUrl,
        description,
        discount: discount || 0,
        category,
        isInStock: isInStock || false,
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
      return res.status(400).json({ message: err });
    }

    const { id } = req.params;
    const { name, price, description, category, discount, isInStock } = req.body;

    if (!id || id === "null" || id === "undefined") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    try {
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.isInStock = isInStock !== undefined ? isInStock : product.isInStock;
      product.discount = discount !== undefined ? discount : product.discount;
      product.discountPrice = product.discount
        ? (product.price - (product.price * product.discount) / 100).toFixed(2)
        : product.price.toFixed(2);

      if (req.file) {
        // Delete old image if it exists
        if (product.image) {
          const oldImagePath = path.join(__dirname, '..', 'public', product.image);
          await fs.unlink(oldImagePath).catch(err => console.error("Failed to delete old image:", err));
        }

        const imageUrl = `/images/products/${req.file.filename}`;
        product.image = imageUrl;
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
  try {
    const { id } = req.params;

    if (!id || id === "null" || id === "undefined") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error in getProduct:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "null" || id === "undefined") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the associated image file
    if (product.image) {
      const imagePath = path.join(__dirname, '..', 'public', product.image);
      await fs.unlink(imagePath).catch(err => console.error("Failed to delete image:", err));
    }

    await Product.deleteOne({ _id: id });
    res.status(200).json({ message: "Product removed", id: id });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
});

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};