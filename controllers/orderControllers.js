const asyncHandler = require("express-async-handler");
const Order = require("../models/ordderModel");

//@desc : Get all orders
//@route : GET /api/order
//@access : public
const getAllOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    next(error);  // This will pass the error to your error handler
  }
});


//@desc : Create order
//@route : POST /api/order
//@access : public
const createOrder = asyncHandler(async (req, res) => {
  const { name, email, phone, address, total, status, products } = req.body;
  if (!name || !email || !products) {
    res.status(400);
    throw new Error("Please provide name, email, and at least one product");
  }
  const order = await Order.create({
    name,
    email,
    phone,
    address,
    total,
    status,
    products,
  });
  res.status(201).json(order);
});

//@desc : Get single order
//@route : GET /api/order/:id
//@access : public
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.status(200).json(order);
});

//@desc : Update order
//@route : PUT /api/order/:id
//@access : public
const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json(updatedOrder);
});

//@desc : Delete order
//@route : DELETE /api/order/:id
//@access : public
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
  updateOrder,
  deleteOrder,
};