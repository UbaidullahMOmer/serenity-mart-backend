// couponCodeController.js
const asyncHandler = require("express-async-handler");
const CouponCode = require("../models/couponCodeModel");

const getAllCouponCodes = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const totalCoupons = await CouponCode.countDocuments();
    const couponCodes = await CouponCode.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex);

    res.status(200).json({
        couponCodes,
        currentPage: page,
        totalPages: Math.ceil(totalCoupons / limit),
        totalCoupons,
    });
});

const createCouponCode = asyncHandler(async (req, res) => {
    const { code, discount, expiryDate, description } = req.body;

    if (!code || !discount || !expiryDate) {
        res.status(400);
        throw new Error("Please provide all required fields: code, discount, and expiryDate");
    }

    const existingCoupon = await CouponCode.findOne({ code });
    if (existingCoupon) {
        res.status(400);
        throw new Error("Coupon code already exists");
    }

    const couponCode = await CouponCode.create({
        code,
        discount,
        expiryDate,
        description,
    });

    res.status(201).json(couponCode);
});

const getCouponCode = asyncHandler(async (req, res) => {
    const couponCode = await CouponCode.findById(req.params.id);
    if (!couponCode) {
        res.status(404);
        throw new Error("Coupon code not found");
    }
    res.status(200).json(couponCode);
});

const updateCouponCode = asyncHandler(async (req, res) => {
    const { code, discount, expiryDate, description } = req.body;

    const couponCode = await CouponCode.findById(req.params.id);
    if (!couponCode) {
        res.status(404);
        throw new Error("Coupon code not found");
    }

    if (code && code !== couponCode.code) {
        const existingCoupon = await CouponCode.findOne({ code });
        if (existingCoupon) {
            res.status(400);
            throw new Error("Coupon code already exists");
        }
    }

    couponCode.code = code || couponCode.code;
    couponCode.discount = discount || couponCode.discount;
    couponCode.expiryDate = expiryDate || couponCode.expiryDate;
    couponCode.description = description !== undefined ? description : couponCode.description;

    const updatedCouponCode = await couponCode.save();
    res.status(200).json(updatedCouponCode);
});

const deleteCouponCode = asyncHandler(async (req, res) => {
    const couponCode = await CouponCode.findById(req.params.id);
    if (!couponCode) {
        res.status(404);
        throw new Error("Coupon code not found");
    }
    await couponCode.remove();
    res.status(200).json({ message: "Coupon code deleted successfully", id: req.params.id });
});

const validateCouponCode = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const couponCode = await CouponCode.findOne({ code });

    if (!couponCode) {
        res.status(404);
        throw new Error("Coupon code not found");
    }

    if (new Date(couponCode.expiryDate) < new Date()) {
        res.status(400);
        throw new Error("Coupon code has expired");
    }

    res.status(200).json({
        valid: true,
        discount: couponCode.discount,
        message: "Coupon code is valid",
    });
});

module.exports = {
    getCouponCode,
    getAllCouponCodes,
    createCouponCode,
    updateCouponCode,
    deleteCouponCode,
    validateCouponCode,
};