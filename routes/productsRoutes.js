const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  getProduct, 
  deleteProduct,
  getProductImage
} = require("../controllers/productControllers");

router.route("/").get(getProducts).post(createProduct);

router.route("/:id").get(getProduct).delete(deleteProduct).put(updateProduct);

router.route("/image/:id").get(getProductImage)

module.exports = router;
