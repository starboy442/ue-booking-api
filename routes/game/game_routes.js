import express from "express";
import auth from "./authRoutes.js";
import review from "./reviewRoutes.js";
import report from "../shared/reportRoutes.js";
const game_router = express.Router();

game_router.use("/api", auth);
game_router.use("/api", review);
game_router.use("/api", report);

export default game_router;
