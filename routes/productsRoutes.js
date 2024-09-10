const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
} = require("../controllers/productControllers");

router.route("/").get(getProducts).post(createProduct);

router.route("/:id").get(getProduct).delete(deleteProduct).put(updateProduct);

module.exports = router;
