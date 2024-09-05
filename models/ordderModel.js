const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
    },
    phone: {
        type: String,  // Change this from Number to String
        required: [true, "Please add a phone number"],
      },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    total: {    
      type: Number,
      required: [true, "Please add a total price"],
    },
    status: {
      type: String,
      default: "Pending",
    },
    products: Array,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
