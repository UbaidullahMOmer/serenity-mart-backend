const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the customer name"],
    },
    email: {
      type: String,
      required: [true, "Please add the customer email address"],
    },
    phone: {
      type: String,
      required: [true, "Please add the customer phone number"],
    },
    address: {
      type: String,
      required: [true, "Please add the customer address"],
    },
    total: {
      type: Number,
      required: [true, "Please add the total amount"],
    },
    status: {
      type: String,
      required: [true, "Please add the order status"],
      default: "Pending",
    },
    products: {
      type: Array,
      required: [true, "Please add at least one product"],
    },
    paymentIntentId: {
      type: String,
      required: [true, "Please add the Stripe Payment Intent ID"],
    },
    specialInstructions: {
      type: String,
    },
    couponCode: {
      type: String,
    },
    couponDiscount: {
      type: Number,
    },
    deliveryType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
