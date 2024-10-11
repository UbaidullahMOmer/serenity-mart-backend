const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  createOrder,
  deleteOrder,
  getOrder,
  updateOrder,
  createSafePayOrder
} = require("../controllers/orderControllers");

router.route("/").get(getAllOrders).post(createOrder);

router.route("/:id").get(getOrder).delete(deleteOrder).put(updateOrder);

router.route("/create-safe-pay-order").post(createSafePayOrder);

module.exports = router;
