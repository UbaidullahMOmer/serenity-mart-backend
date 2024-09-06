const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  createOrder,
  deleteOrder,
  getOrder,
} = require("../controllers/orderControllers");

router.route("/").get(getAllOrders).post(createOrder);

router.route("/:id").get(getOrder).delete(deleteOrder)

module.exports = router;
