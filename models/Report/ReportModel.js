import mongoose from "mongoose";
const { Schema, model } = mongoose;
const ReportSchema = Schema(
  {
    reported_user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: "users",
    },
    reported_by_user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
      ref: "users",
    },
    report_reason: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const ReportModel = model("reports", ReportSchema);

export default ReportModel;
