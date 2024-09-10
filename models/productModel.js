const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the product name"],
    },
    price: {
      type: Number,
      required: [true, "Please add the product price"],
    },
    discountPrice: {
      type: Number,
      required: [true, "Please add the product discount price"],
    },
    image: {
      type: String,
      required: [true, "Please add the product image"],
    },
    description: {
      type: String,
      required: [true, "Please add the product description"],
    },
    discount: {
      type: Number,
      required: [true, "Please add the product discount"],
    },
    category: {
      type: String,
      required: [true, "Please add the product category"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);