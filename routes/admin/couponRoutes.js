import express from "express";
import CouponController from "../../controllers/Coupon/CouponController.js";
const coupon = express.Router();

coupon.post("/coupon/add", CouponController.addCoupon);
coupon.get("/coupons", CouponController.getAllCoupons);
coupon.get("/coupon/:coupon_code", CouponController.getCouponByCode);
coupon.delete("/coupon/:coupon_id", CouponController.deleteCouponById);

export default coupon;
