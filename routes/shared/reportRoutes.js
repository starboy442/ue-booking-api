import express from "express";
import ReportController from "../../controllers/Report/ReportController.js";

const report = express.Router();

report.post("/report", ReportController.reportUser);
report.get("/reports", ReportController.getAllReportedUsers);

export default report;
