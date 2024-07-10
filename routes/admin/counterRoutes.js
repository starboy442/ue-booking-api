import express from "express";
import CounterController from "../../controllers/Counter/CounterController.js";
const counter = express.Router();

counter.get("/counter/appointments", CounterController.total_appointments);
counter.get("/counter/users", CounterController.total_users);
counter.get("/counter/reported_users", CounterController.total_reported_users);

export default counter;
