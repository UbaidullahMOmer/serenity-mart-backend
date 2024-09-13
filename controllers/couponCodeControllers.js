const asyncHandler = require("express-async-handler");
const CouponCode = require("../models/couponCodeModel");

const getAllCouponCodes = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error in getAllCouponCodes:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const createCouponCode = asyncHandler(async (req, res) => {
  try {
    const { code, discount, expiryDate, description, usageLimit } = req.body;
    console.log("Received request body:", req.body);

    if (!code || !discount || !expiryDate || !usageLimit) {
      return res.status(400).json({
        message: "Please provide all required fields: code, discount, expiryDate, and usageLimit"
      });
    }

    const existingCoupon = await CouponCode.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const couponCode = await CouponCode.create({
      code,
      discount: Number(discount),
      expiryDate,
      description,
      usageLimit: Number(usageLimit),
    });

    res.status(201).json(couponCode);
  } catch (error) {
    console.error("Error in createCouponCode:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const getCouponCode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested coupon ID:", id);

    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({ message: "Coupon ID is required" });
    }
    const couponCode = await CouponCode.findById(req.params.id);
    if (!couponCode) {
      return res.status(404).json({ message: "Coupon code not found" });
    }
    res.status(200).json(couponCode);
  } catch (error) {
    console.error("Error in getCouponCode:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const updateCouponCode = asyncHandler(async (req, res) => {
  try {
    const { code, discount, expiryDate, description, usageLimit } = req.body;
    console.log("Update request body:", req.body);

    const { id } = req.params;
    console.log("Requested coupon ID:", id);

    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({ message: "Coupon ID is required" });
    }
    const couponCode = await CouponCode.findById(req.params.id);
    if (!couponCode) {
      return res.status(404).json({ message: "Coupon code not found" });
    }

    if (code && code !== couponCode.code) {
      const existingCoupon = await CouponCode.findOne({ code });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
    }

    couponCode.code = code || couponCode.code;
    couponCode.discount = discount !== undefined ? Number(discount) : couponCode.discount;
    couponCode.expiryDate = expiryDate || couponCode.expiryDate;
    couponCode.description = description !== undefined ? description : couponCode.description;
    couponCode.usageLimit = usageLimit !== undefined ? Number(usageLimit) : couponCode.usageLimit;

    const updatedCouponCode = await couponCode.save();
    res.status(200).json(updatedCouponCode);
  } catch (error) {
    console.error("Error in updateCouponCode:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const deleteCouponCode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested coupon ID:", id);

    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({ message: "Coupon ID is required" });
    }
    const couponCode = await CouponCode.findByIdAndDelete(req.params.id);
    if (!couponCode) {
      return res.status(404).json({ message: "Coupon code not found" });
    }

    res.status(200).json({ message: "Coupon code deleted", id: req.params.id });
  } catch (error) {
    console.error("Error in deleteCouponCode:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const validateCouponCode = asyncHandler(async (req, res) => {
  try {
    const { code } = req.params;
    const couponCode = await CouponCode.findOne({ code });

    if (!couponCode) {
      return res.status(404).json({ message: "Coupon code not found" });
    }

    const now = new Date();
    if (now > new Date(couponCode.expiryDate)) {
      if (couponCode.isActive) {
        couponCode.isActive = false;
        await couponCode.save();
      }
      return res.status(400).json({ message: "Coupon code has expired" });
    }

    if (!couponCode.isActive) {
      return res.status(400).json({ message: "Coupon code is no longer active" });
    }

    // Check if usage count has reached the limit
    if (couponCode.usageCount >= couponCode.usageLimit) {
      couponCode.isActive = false;
      await couponCode.save();
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // Increment the usage count
    couponCode.usageCount += 1;
    if (couponCode.usageCount === couponCode.usageLimit) {
      couponCode.isActive = false;
    }
    await couponCode.save();

    res.status(200).json({
      valid: true,
      discount: couponCode.discount,
      message: "Coupon code is valid",
    });
  } catch (error) {
    console.error("Error in validateCouponCode:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = {
  getCouponCode,
  getAllCouponCodes,
  createCouponCode,
  updateCouponCode,
  deleteCouponCode,
  validateCouponCode,
};