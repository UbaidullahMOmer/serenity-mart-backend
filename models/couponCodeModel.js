// couponCodeModel.js
const mongoose = require("mongoose");

const couponCodeSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Please add the coupon code"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        discount: {
            type: Number,
            required: [true, "Please add the coupon discount"],
            min: [0, "Discount cannot be negative"],
            max: [100, "Discount cannot exceed 100%"],
        },
        expiryDate: {
            type: Date,
            required: [true, "Please add the coupon expiry date"],
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageLimit: {
            type: Number,
            default: null,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

couponCodeSchema.pre('save', function(next) {
    this.code = this.code.toUpperCase();
    next();
});

module.exports = mongoose.model("CouponCode", couponCodeSchema);