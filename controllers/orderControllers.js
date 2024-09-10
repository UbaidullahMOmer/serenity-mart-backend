const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const getAllOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
const createOrder = asyncHandler(async (req, res) => {
  const { name, email, phone, address, total, products, paymentIntentId, specialInstructions } = req.body;

  if (!name || !email || !products || !paymentIntentId) {
    res.status(400);
    throw new Error("Please provide name, email, products, and payment intent ID");
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== "succeeded") {
      res.status(400);
      throw new Error("Payment not successful");
    }

    const order = await Order.create({
      name,
      email,
      phone,
      address,
      total,
      products,
      paymentIntentId,
      specialInstructions,
      status: "Pending",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.remove();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getAllOrders,
  createOrder,
  getOrder,
  deleteOrder,
};
