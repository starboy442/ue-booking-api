import express from "express";
import auth from "./authRoutes.js";
import user from "./userRoutes.js";
import appointment from "./appointmetnRoutes.js";
import coupon from "./couponRoutes.js";
import report from "../shared/reportRoutes.js";
import counter from "./counterRoutes.js";
const admin_router = express.Router();

admin_router.use("/api/admin", auth);
admin_router.use("/api/admin", user);
admin_router.use("/api/admin", appointment);
admin_router.use("/api/admin", coupon);
admin_router.use("/api/admin", report);
admin_router.use("/api/admin", counter);

export default admin_router;
