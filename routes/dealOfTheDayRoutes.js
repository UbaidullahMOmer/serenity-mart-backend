const express = require("express");
const router = express.Router();

const {
  getDealOfTheDay,
  updateDealOfTheDay,
} = require("../controllers/dealOfTheDayControllers.js");

router.get("/", getDealOfTheDay);

router.put("/", updateDealOfTheDay);

module.exports = router;
