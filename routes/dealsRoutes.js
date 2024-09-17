const express = require("express");
const router = express.Router();
const {
  getDeals,
  createDeal,
  updateDeal,
  getDeal, 
  deleteDeal,
} = require("../controllers/dealsConrollers");

router.route("/").get(getDeals).post(createDeal);

router.route("/:id").get(getDeal).delete(deleteDeal).put(updateDeal);

module.exports = router;
