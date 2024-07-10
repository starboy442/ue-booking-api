import mongoose from "mongoose";

const Schema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      unqiue: true,
    },
    review: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const ReviewModel = mongoose.model("reviews", Schema);

export default ReviewModel;
