const mongoose = require("mongoose");

const dealSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add the deal name"],
    },
    price: {
      type: Number,
      required: [true, "Please add the deal price"],
    },
    discountPrice: {
      type: Number,
      required: [true, "Please add the deal discount price"],
    },
    image: {
      type: String,
      required: [true, "Please add the deal image"],
    },
    description: {
      type: String,
      required: [true, "Please add the deal description"],
    },
    discount: {
      type: Number,
      required: [true, "Please add the deal discount"],
    },
    category: {
      type: String,
      required: [true, "Please add the deal category"],
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

module.exports = mongoose.model("Deal", dealSchema);
