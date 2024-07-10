import AppointmentModel from "../../models/Appointment/AppointmentModel.js";
import ReportModel from "../../models/Report/ReportModel.js";
import UserModel from "../../models/user/UserModel.js";
class CounterController {
  static total_appointments = async (req, res) => {
    try {
      const appointments = await AppointmentModel.find({});
      return res.send({
        status: "success",
        total_appointments: appointments.length,
      });
    } catch (error) {
      return res.send({ status: "error", message: error.message });
    }
  };
  static total_users = async (req, res) => {
    try {
      const users = await UserModel.find({});
      return res.send({
        status: "success",
        total_users: users.length,
      });
    } catch (error) {
      return res.send({ status: "error", message: error.message });
    }
  };

  static total_reported_users = async (req, res) => {
    try {
      const reported_users = await ReportModel.find({});
      return res.send({
        status: "success",
        total_reported_users: reported_users.length,
      });
    } catch (error) {
      return res.send({ status: "error", message: error.message });
    }
  };
}

export default CounterController;
