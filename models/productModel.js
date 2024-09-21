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
    sizes: {
      type: Array,
      required: [true, "Please add the product size"],
    },
    category: {
      type: String,
      required: [true, "Please add the product category"],
    },
    isInStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
