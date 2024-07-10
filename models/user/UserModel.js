import mongoose from "mongoose";

const Schema = mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unqiue: true },
    email: { type: String, required: true, trim: true, unqiue: true },
    password: { type: String, required: true, trim: true },
    banned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", Schema);

export default UserModel;
