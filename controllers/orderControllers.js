const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "itsubaidullahomer@gmail.com",
    pass: "jvpl omvt bcab trrx",
  },
});

const sendStatusChangeEmail = async (email, status) => {
  const statusMessages = {
    PENDING: "Your order has been received and is pending processing.",
    ACCEPTED: "Great news! Your order has been accepted and is being prepared.",
    DELIVERING: "Your order is now out for delivery!",
    COMPLETED: "Your order is now completed. Thank you for your business!",
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Status Update: ${
      status.charAt(0).toUpperCase() + status.slice(1)
    }`,
    text: `Hello,\n\n${statusMessages[status]}\n\nThank you for your order!`,
  };

  await transporter.sendMail(mailOptions);
};

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
    paymentMethod = "stripe",
  } = req.body;

  if (!name || !email || !products || !total || !address || !phone) {
    res.status(400);
    throw new Error(
      "Please provide name, email, products, total, address, and phone"
    );
  }

  try {
    if (paymentMethod === "stripe") {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

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

    const templatePath = path.join(__dirname, "./orderConfirmationCool.html");
    let htmlTemplate = await fs.readFile(templatePath, "utf-8");

    htmlTemplate = htmlTemplate
      .replace("{{name}}", name)
      .replace("{{orderId}}", order._id)
      .replace("{{total}}", total)
      .replace("{{status}}", status || "Pending");

    const orderCreationEmail = {
      to: email,
      subject: "🎉 Your Awesome Order is Confirmed! 🛍️",
      html: htmlTemplate,
    };

    await transporter.sendMail(orderCreationEmail);

    if (status) {
      await sendStatusChangeEmail(email, status);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to create order: ${error}` });
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to delete order: ${error}` });
  }
});

const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const oldStatus = order.status;
  const newStatus = req.body.status;
  Object.assign(order, req.body);
  await order.save();
  if (newStatus && oldStatus !== newStatus) {
    try {
      await sendStatusChangeEmail(order.email, newStatus);
      console.log(`Status change email sent to ${order.email}`);
    } catch (error) {
      console.error("Error sending status change email:", error);
    }
  }
  res.status(200).json(order);
});

module.exports = {
  getAllOrders,
  createOrder,
  getOrder,
  deleteOrder,
  updateOrder,
};
