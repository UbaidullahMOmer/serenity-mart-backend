const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

const getProducts = asyncHandler(async (req, res) => {
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
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, description, category, discount } = req.body;

  if (!name || !price || !image || !description || !category) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const discountPrice = discount ? price - (price * discount) / 100 : price;

  const product = await Product.create({
    name,
    price,
    discountPrice,
    image,
    description,
    discount: discount || 0,
    category,
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, image, description, category, discount } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.name = name || product.name;
  product.price = price || product.price;
  product.image = image || product.image;
  product.description = description || product.description;
  product.category = category || product.category;
  product.discount = discount !== undefined ? discount : product.discount;
  product.discountPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await Product.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: "Product removed", id: req.params.id });
});

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};
