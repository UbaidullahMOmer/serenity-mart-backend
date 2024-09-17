const asyncHandler = require("express-async-handler");
const NewArrival = require("../models/newArrivalModel.js");

const getNewArrival = asyncHandler(async (req, res) => {
    try {
      const newArrival = await NewArrival.findOneOrCreate();
      await newArrival.populate('products');
      res.status(200).json(newArrival);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Failed to get newArrival", error: error.message });
    }
  });

const updateNewArrival = asyncHandler(async (req, res) => {
  try {
    const newArrival = await NewArrival.findOneOrCreate();

    newArrival.title = req.body.title || newArrival.title;
    newArrival.description = req.body.description || newArrival.description;
    if (req.body.products) {
      newArrival.products = req.body.products;
    }

    const updatedNewArrival = await newArrival.save();
    res.status(200).json(updatedNewArrival);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update newArrival", error: error.message });
  }
});

const addProductToNewArrival = asyncHandler(async (req, res) => {
  try {
    const newArrival = await NewArrival.findOneOrCreate();
    const productId = req.body.productId;

    if (!newArrival.products.includes(productId)) {
      newArrival.products.push(productId);
      await newArrival.save();
    }

    res.status(200).json(newArrival);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to add product to newArrival", error: error.message });
  }
});

const removeProductFromNewArrival = asyncHandler(async (req, res) => {
  try {
    const newArrival = await NewArrival.findOneOrCreate();
    const productId = req.params.productId;

    newArrival.products = newArrival.products.filter(id => id.toString() !== productId);
    await newArrival.save();

    res.status(200).json(newArrival); 
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to remove product from newArrival", error: error.message });
  }
});

module.exports = {
  getNewArrival,
  updateNewArrival,
  addProductToNewArrival,
  removeProductFromNewArrival
};