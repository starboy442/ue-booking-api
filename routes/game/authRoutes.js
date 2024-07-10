import express from "express";
import AuthController from "../../controllers/Auth/AuthController.js";
import UserModel from "../../models/user/UserModel.js";
import AppointmentController from "../../controllers/Appointment/AppointmentController.js";
import {
  register_middleware,
  authenticate_middleware,
  authorize_middleware,
} from "../../middlewares/auth_middleware.js";

const auth = express.Router();

auth.get(
  "/user/auth",
  authorize_middleware(UserModel),
  AuthController.authorized
);
auth.post(
  "/user/auth",
  authenticate_middleware,
  AuthController.authenticate(UserModel)
);
auth.post(
  "/user/register",
  register_middleware("user"),
  AuthController.register("user")
);
auth.post("/user/auth/mail", AuthController.send_reset_link_mail(UserModel));
auth.post("/user/auth/:id/:token", AuthController.reset_password(UserModel));
auth.patch(
  "/user/auth",
  authorize_middleware(UserModel),
  AuthController.update_password(UserModel)
);

auth.get(
  "/user/appointments/:user_id",
  AppointmentController.get_user_appointment
);

export default auth;
