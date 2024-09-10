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
  
  router.route("/").get(getAllCouponCodes).post(createCouponCode);
  
  router
    .route("/:id")
    .get(getCouponCode)
    .delete(deleteCouponCode)
    .put(updateCouponCode);
  
  router.route("/:id/validate").get(validateCouponCode);
  
  module.exports = router;
   