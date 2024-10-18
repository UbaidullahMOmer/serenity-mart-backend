const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const asyncRetry = require("async-retry");

// SafePay configuration
const SAFEPAY_ENVIRONMENT = "sandbox"; // Change to "production" for live transactions
const SAFEPAY_API_KEY = "sec_0cdaa856-0741-4a73-bed2-520ce4ce0478";
const SAFEPAY_SECRET = "6db29d93b8f49a4924d63dc5699e9feab0283bacd2dd65734d8bb6a8a53c1d6f";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "serenitymartpk@gmail.com",
    pass: "ciwy ibkv xsex fzbo",
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
    subject: `Order Status Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
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

const createSafePayOrder = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    total,
    products,
    specialInstructions,
  } = req.body;

  if (!name || !email || !products || !total || !address || !phone) {
    res.status(400);
    throw new Error(
      "Please provide name, email, products, total, address, and phone"
    );
  }

  try {
    // Create the order in your database first
    const order = await Order.create({
      name,
      email,
      phone,
      address,
      total,
      products,
      specialInstructions,
      status: "PENDING",
      paymentMethod: "safepay",
    });

    const payload = {
      amount: total,
      currency: "PKR",
      cancel_url: `${process.env.FRONTEND_URL}/cancel?orderId=${order._id}`,
      success_url: `${process.env.FRONTEND_URL}/success?orderId=${order._id}`,
      order: {
        id: order._id.toString(),
        name,
        email,
        phone,
        address,
        products: products.map(p => ({ name: p.name, quantity: p.quantity, price: p.price })),
        special_instructions: specialInstructions,
      },
    };

    const makeApiCall = async (bail) => {
      try {
        const response = await axios.post(
          `https://sandbox.api.getsafepay.com/order/v1/init`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SAFEPAY_API_KEY}:${SAFEPAY_SECRET}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          // Don't retry for 4xx errors
          bail(error);
          return;
        }
        throw error;
      }
    };

    let result;
    try {
      result = await asyncRetry(makeApiCall, {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 5000,
      });
    } catch (error) {
      console.error('SafePay API Error:', error.response ? error.response.data : error.message);
      
      // Fallback to mock API if SafePay API fails
      result = {
        status: "success",
        data: {
          checkout_url: `http://localhost:5173/mock-safepay-checkout?orderId=${order._id}`,
          token: "mock_token_" + Math.random().toString(36).substr(2, 9),
        }
      };
      console.log('Using mock SafePay API response');
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to create SafePay order: ${error.message}` });
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
    paymentMethod = "safepay",
  } = req.body;

  if (!name || !email || !products || !total || !address || !phone) {
    res.status(400);
    throw new Error(
      "Please provide name, email, products, total, address, and phone"
    );
  }

  try {
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
    res.status(500).json({ error: `Failed to create order: ${error.message}` });
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
    res.status(500).json({ error: `Failed to delete order: ${error.message}` });
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
  createSafePayOrder,
};