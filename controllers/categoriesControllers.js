// categoriesController.js
const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel.js");

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().select("name description").sort("name");
  res.status(200).json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description },
    { new: true, runValidators: true }
  );
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json({ message: "Category deleted successfully", id: req.params.id });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json(category);
});

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
};