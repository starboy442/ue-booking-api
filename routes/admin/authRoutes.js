import express from "express";
import AuthController from "../../controllers/Auth/AuthController.js";
import AdminModel from "../../models/admin/AdminModel.js";
import {
  register_middleware,
  authenticate_middleware,
  authorize_middleware,
} from "../../middlewares/auth_middleware.js";

const auth = express.Router();

// Admin Auth routes
auth.get("/auth", authorize_middleware(AdminModel), AuthController.authorized);
auth.post(
  "/auth",
  authenticate_middleware,
  AuthController.authenticate(AdminModel)
);
auth.post(
  "/auth/register",
  register_middleware("admin"),
  AuthController.register("admin")
);
auth.post("/auth/mail", AuthController.send_reset_link_mail(AdminModel));
auth.post("/auth/:id/:token", AuthController.reset_password(AdminModel));
auth.patch(
  "/auth",
  authorize_middleware(AdminModel),
  AuthController.update_password(AdminModel)
);



export default auth;
