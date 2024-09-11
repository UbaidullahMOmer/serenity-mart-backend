const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel.js");

const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find().select("name description").sort("name");
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
});

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(400).json({ message: "Failed to create category", error: error.message });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Category ID is required" });
  }
  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(400).json({ message: "Failed to update category", error: error.message });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested coupon ID:", id);

    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({ message: "Category ID is required" });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({ message: "Failed to delete category", error: error.message });
  }
});

const getCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested coupon ID:", id);

    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({ message: "Category ID is required" });
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error in getCategory:", error);
    res.status(500).json({ message: "Failed to fetch category", error: error.message });
  }
});

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  getCategory,
  deleteCategory,
};