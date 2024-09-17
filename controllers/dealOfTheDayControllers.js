const asyncHandler = require("express-async-handler");
const DealOfTheDay = require("../models/dealOfTheDayModel.js");

const getDealOfTheDay = asyncHandler(async (req, res) => {
  try {
    const dealOfTheDay = await DealOfTheDay.findOneOrCreate();
    res.status(200).json(dealOfTheDay);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to get dealOfTheDay", error: error.message });
  }
});

const updateDealOfTheDay = asyncHandler(async (req, res) => {
  try {
    const dealOfTheDay = await DealOfTheDay.findOneOrCreate();

    dealOfTheDay.name = req.body.name || dealOfTheDay.name;
    dealOfTheDay.description = req.body.description || dealOfTheDay.description;
      dealOfTheDay.product = req.body.product || dealOfTheDay.product;

    const updatedDealOfTheDay = await dealOfTheDay.save();
    res.status(200).json(updatedDealOfTheDay);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to update dealOfTheDay", error: error.message });
  }
});

module.exports = { getDealOfTheDay, updateDealOfTheDay };
