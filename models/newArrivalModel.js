const mongoose = require("mongoose");

const newArrivalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add the newArrival title"],
    },
    description: {
      type: String,
      required: [true, "Please add the newArrival description"],
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  {
    timestamps: true,
  }
);

newArrivalSchema.statics.findOneOrCreate = async function () {
  let newArrival = await this.findOne();
  if (!newArrival) {
    newArrival = await this.create({
      title: "Default Title",
      description: "Default Description",
      products: []
    });
  }
  return newArrival;
};

module.exports = mongoose.model("NewArrival", newArrivalSchema);