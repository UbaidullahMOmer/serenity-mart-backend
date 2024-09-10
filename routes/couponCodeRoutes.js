const express = require("express");
const router = express.Router();

const {
  getCouponCode,
  getAllCouponCodes,
  createCouponCode,
  updateCouponCode,
  deleteCouponCode,
  validateCouponCode,
} = require("../controllers/couponCodeControllers");
router.route("/")
  .get(getAllCouponCodes)
  .post(createCouponCode);
router.route("/:id")
  .get(getCouponCode)
  .put(updateCouponCode)
  .delete(deleteCouponCode);
router.route("/validate/:code")
  .get(validateCouponCode);

module.exports = router;