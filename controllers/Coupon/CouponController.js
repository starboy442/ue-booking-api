import CouponModel from "../../models/coupon/CouponModel.js";
import { isISOTime } from "../../utils/Functions.js";
import moment from "moment-timezone";
class CouponController {
  static addCoupon = async (req, res) => {
    let { coupon, coupon_expiry_time } = req.body;
    if (coupon && coupon_expiry_time) {
      try {
        if (isISOTime(coupon_expiry_time)) {
          const parseTime = moment(coupon_expiry_time, "HH:mm");
          const utcTime = parseTime.utc();
          coupon_expiry_time = new Date(utcTime).toISOString();
        }
        const currentDate = new Date().toISOString();
        if (coupon_expiry_time < currentDate) {
          res.send({ status: "error", message: "Invalid Expiry Time" });
        } else {
          const coupons = await CouponModel.find({
            coupon: coupon,
          });
          if (coupons.length > 0) {
            res.send({ status: "error", message: "Coupon already exist!" });
          } else {
            const new_coupon = new CouponModel({
              coupon: coupon,
              coupon_expiry_time: coupon_expiry_time,
            });
            await new_coupon
              .save()
              .then(() => {
                res.send({
                  status: "success",
                  message: "Coupon saved successfully!",
                });
              })
              .catch((error) => {
                res.send({ status: "error", message: error.message });
              });
          }
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    }
  };
  static getAllCoupons = async (req, res) => {
    try {
      const coupons = await CouponModel.find({});
      if (coupons.length > 0) {
        res.send({ status: "success", coupons: coupons });
      } else {
        res.send({ status: "error", message: "Coupons not found!" });
      }
    } catch (error) {
      res.send({ status: "error", message: error.message });
    }
  };
  static getCouponByCode = async (req, res) => {
    const { coupon_code } = req.params;
    if (coupon_code) {
      try {
        const coupon = await CouponModel.find({ coupon: coupon_code });
        if (coupon) {
          res.send({ status: "success", coupon: coupon });
        } else {
          res.send({ status: "error", message: "Coupon not found!" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    }
  };
  static deleteCouponById = async (req, res) => {
    const { coupon_id } = req.params;
    if (coupon_id) {
      try {
        const coupon = await CouponModel.findOneAndDelete({ _id: coupon_id });
        if (coupon) {
          res.send({
            status: "success",
            message: "Coupon deleted successfully!",
          });
        } else {
          res.send({ status: "error", message: "Coupon not found!" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    }
  };
}

export default CouponController;
