import mongoose from "mongoose";
import ReportModel from "../../models/Report/ReportModel.js";
class ReportController {
  static reportUser = async (req, res) => {
    const { reported_user_id, reported_by_user_id, report_reason } = req.body;
    try {
      if (reported_by_user_id && reported_user_id && report_reason) {
        const save_reported_user = new ReportModel({
          reported_user_id: new mongoose.Types.ObjectId(reported_user_id),
          reported_by_user_id: new mongoose.Types.ObjectId(reported_by_user_id),
          report_reason,
        });
        await save_reported_user
          .save()
          .then(() => {
            return res.send({
              status: "success",
              message: "User reported successfully!",
            });
          })
          .catch((error) => {
            return res.send({
              status: "error",
              message: error.message,
            });
          });
      } else {
        return res.send({
          status: "error",
          message: "Report reason is required!",
        });
      }
    } catch (error) {
      return res.send({
        status: "error",
        message: error.message,
      });
    }
  };

  static getAllReportedUsers = async (req, res) => {
    try {
      const reported_users = await ReportModel.find()
        .populate({ path: "reported_user_id", select: "username _id banned" })
        .populate("reported_by_user_id", "username");
      if (reported_users.length > 0) {
        return res.send({ status: "success", reported_users: reported_users });
      } else {
        return res.send({ status: "error", message: "No reported user found" });
      }
    } catch (error) {
      return res.send({ status: "error", message: error.message });
    }
  };
}

export default ReportController;
