const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const multer = require("multer");
const path = require("path");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
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

    const { name, price, description, category, discount } = req.body;

    if (!name || !price || !description || !category) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please provide an image file" });
    }

    const imageBuffer = req.file.buffer.toString("base64");
    const discountPrice = discount ? (price - (price * discount) / 100).toFixed(2) : price.toFixed(2);


    try {
      const product = await Product.create({
        name,
        price,
        discountPrice,
        image: `data:${req.file.mimetype};base64,${imageBuffer}`,
        description,
        discount: discount || 0,
        category,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error in createProduct:", error);
      res.status(500).json({ message: "Failed to create product", error: error.message });
    }
  });
});


const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested product ID for update:", id);

    if (!id || id === "null" || id === "undefined") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    upload(req, res, async (err) => {
      if (err) {
        res.status(400);
        throw new Error(err.message);
      }

      const { name, price, description, category, discount } = req.body;
      const product = await Product.findById(id);

      if (!product) {
        res.status(404);
        throw new Error("Product not found");
      }

      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.discount = discount !== undefined ? discount : product.discount;
      product.discountPrice = product.discount
        ? (product.price - (product.price * product.discount) / 100).toFixed(2)
        : product.price.toFixed(2);
      if (req.file) {
        const image = req.file.buffer.toString("base64");
        product.image = `data:${req.file.mimetype};base64,${image}`;
      }

      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
});

const getProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested product ID:", id);

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
    console.log("Requested product ID for deletion:", id);

    if (!id || id === "null" || id === "undefined") {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
