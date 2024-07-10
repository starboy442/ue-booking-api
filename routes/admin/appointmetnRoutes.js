import express from "express";
import AppointmentController from "../../controllers/Appointment/AppointmentController.js";

const appointment = express.Router();

appointment.get("/appointments", AppointmentController.get_all_appointments);
appointment.get(
  "/appointments/recent",
  AppointmentController.getAllAppointmentsInDesc
);

appointment.get(
  "/appointment/:appointment_id",
  AppointmentController.get_appointment
);

appointment.get(
  "/appointments/upcoming/:user_id",
  AppointmentController.getUpcomingAppointments
);

appointment.get("/appointments/slots", AppointmentController.getAvailableSlots);

appointment.post("/appointment/book", AppointmentController.book_appointment);

appointment.patch(
  "/appointment/verify",
  AppointmentController.verify_appointment
);

appointment.get("/appointment/data/dummy", AppointmentController.dummyAppointment);

export default appointment;
