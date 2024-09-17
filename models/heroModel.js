const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add the hero title"],
    },
    description: {
        type: String,
        required: [true, "Please add the hero description"],
    },
    images: [{
        type: String,
        required: [true, "Please add the hero image"],
    }],
}, {
    timestamps: true,
});

heroSchema.statics.findOneOrCreate = async function () {
    const hero = await this.findOne();
    if (hero) {
        return hero;
    }
    return this.create({
        title: "Default Title",
        description: "Default Description",
        images: []
    });
};

module.exports = mongoose.model("Hero", heroSchema);