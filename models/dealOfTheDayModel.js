const mongoose = require("mongoose");

const dealOfTheDaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add the deal name"],
    },
    description: {
        type: String,
        required: [true, "Please add the deal description"],
    },
    product: {
        type: Object,
    }
}, {
    timestamps: true,
});

dealOfTheDaySchema.statics.findOneOrCreate = async function() {
    const dealOfTheDay = await this.findOne();
    if (dealOfTheDay) {
        return dealOfTheDay;
    }
    return this.create({
        name: "Default Deal",
        description: "Default Description",
        product: {}
    });
};

module.exports = mongoose.model("DealOfTheDay", dealOfTheDaySchema);