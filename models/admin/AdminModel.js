import mongoose from "mongoose";

const Schema = mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unqiue: true },
    email: { type: String, required: true, trim: true, unqiue: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "admin",
      trim: true,
    },
    password: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

const AdminModel = mongoose.model("admins", Schema);

export default AdminModel;
