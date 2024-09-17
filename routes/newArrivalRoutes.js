const express = require("express");
const router = express.Router();

const {
  getNewArrival,
  updateNewArrival,
  addProductToNewArrival,
  removeProductFromNewArrival,
} = require("../controllers/newArrivalControllers.js");

router.get("/", getNewArrival);
router.put("/", updateNewArrival);
router.post("/addProduct", addProductToNewArrival);
router.delete("/removeProduct/:productId", removeProductFromNewArrival);

module.exports = router;
