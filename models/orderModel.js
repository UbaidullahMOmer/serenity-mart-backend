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
      default: "Pending",
    },
    products: {
      type: Array,
      required: [true, "Please add at least one product"],
    },
    paymentIntentId: {
      type: String,
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
    paymentMethod: {
      type: String,
      default: "stripe"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
