import express from "express";
import AuthController from "../../controllers/Auth/AuthController.js";
import UserModel from "../../models/user/UserModel.js";
const user = express.Router();

user.get("/users", AuthController.users(UserModel));
user.get("/user/delete/:user_id", AuthController.delete_user(UserModel));
user.patch("/user/banned", AuthController.banned_user);
user.patch("/user/unbanned", AuthController.un_banned_user);
user.get("/user/banned", AuthController.getBannedUsers);
export default user;
