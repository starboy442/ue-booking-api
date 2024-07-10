import mongoose from "mongoose";

const Schema = mongoose.Schema(
  {
    coupon: { type: String, required: true, trim: true },
    coupon_expiry_time: {
      type: Date,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const CouponModel = mongoose.model("coupons", Schema);

export default CouponModel;
