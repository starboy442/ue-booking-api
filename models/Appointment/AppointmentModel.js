import mongoose from "mongoose";

const urlSchema = mongoose.Schema({
  space_screen_id: { type: String, default: "" },
  url: { type: String, trim: true, default: "" },
});

const Schema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      unqiue: true,
    },
    booking_name: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    booking_start_time: {
      type: Date,
      required: true,
      trim: true,
    },
    booking_end_time: {
      type: Date,
      required: true,
      trim: true,
    },
    booking_date: {
      type: String,
      required: true,
      trim: true,
    },
    // booking_duration: { type: Number, required: true, default: 0 },
    total_screen: { type: Number, required: true, default: 0 },
    screen_space: { type: String, required: true },
    streaming_urls: [urlSchema],
    content_description: { type: String, trim: true, required: true },
    coupon: { type: String, trim: true, default: "" },
    status: { type: String, trim: true, default: "Pending" },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const AppointmentModel = mongoose.model("appointments", Schema);

export default AppointmentModel;
