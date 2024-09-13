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
  const {
    name,
    email,
    phone,
    address,
    total,
    products,
    discount,
    paymentIntentId,
    specialInstructions,
    status,
    paymentMethod = "stripe"
  } = req.body;

  if (!name || !email || !products, !total, !address, !phone) {
    res.status(400);
    throw new Error(
      "Please provide name, email, products, and payment intent ID"
    );
  }

  try {
    if(paymentMethod == 'stripe'){
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
      if (paymentIntent.status !== "succeeded") {
        res.status(400);
        throw new Error("Payment not successful");
      }
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
      discount,
      status,
      paymentMethod,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to create order ${error} ` });
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
  try {

    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    res.status(200).json({ id: req.params.id });
  }  catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to delete order ${error} ` });
  }

});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.status = req.body.status || order.status;
  await order.save();
  res.status(200).json(order);
});

module.exports = {
  getAllOrders,
  createOrder,
  getOrder,
  deleteOrder,
  updateOrder,
};
