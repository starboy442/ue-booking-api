import AppointmentModel from "../../models/Appointment/AppointmentModel.js";
import CouponModel from "../../models/coupon/CouponModel.js";
import moment from "moment-timezone";

class AppointmentController {
  /**
   * Handles booking an appointment by creating a new appointment instance in the database.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  static book_appointment = async (req, res) => {
    const {
      user_id,
      booking_start_time,
      booking_end_time,
      booking_date,
      screen_space,
      streaming_urls,
      content_description,
    } = req.body;
    try {
      let currentTime = new Date().toISOString();
      if (
        user_id &&
        booking_start_time &&
        booking_end_time &&
        booking_date &&
        content_description &&
        screen_space
      ) {
        const conflictingAppointment = await AppointmentModel.find({
          booking_date: booking_date,
          booking_start_time: { $lt: booking_end_time },
          booking_end_time: { $gt: booking_start_time },
        });
        if (conflictingAppointment.length > 0) {
          await AppointmentController.isConflictingAppointment(
            conflictingAppointment,
            screen_space,
            currentTime,
            req,
            res
          );
        } else if (
          !AppointmentController.validateBookingDateTime(
            booking_start_time,
            booking_end_time,
            currentTime
          )
        ) {
          return res.send({
            status: "error",
            message: "Invalid date/time select for booking!",
          });
        } else if (
          await AppointmentController.validateBookingCoupon(
            req.body.coupon,
            currentTime
          )
        ) {
          const screen_space_urls = [];
          const screen_spaces_arr = screen_space.split(" ");
          if (req.body.streaming_urls?.length > 0) {
            streaming_urls.forEach((url, index) => {
              const screen_space_url_obj = {
                space_screen_id: screen_spaces_arr[index],
                url: url,
              };
              screen_space_urls.push(screen_space_url_obj);
            });
          }

          const appointment = new AppointmentModel({
            user_id: user_id,
            booking_name: req.body.booking_name || "",
            booking_start_time: booking_start_time,
            booking_end_time: booking_end_time,
            booking_date: booking_date,
            total_screen:
              req.body.total_screen || screen_space.split(" ").length,
            screen_space: screen_space,
            streaming_urls:
              screen_space_urls.length > 0 ? screen_space_urls : [],
            content_description: content_description,
            coupon: req.body.coupon || "",
          });
          await appointment
            .save()
            .then(() => {
              return res.send({
                status: "success",
                message: "Appointment booked successfully",
              });
            })
            .catch((err) => {
              return res.send({
                status: "error",
                message: `${err.name}: ${err.message}`,
              });
            });
        } else {
          return res.send({ status: "error", message: "Invalid Coupon!" });
        }
      } else {
        return res.send({
          status: "error",
          message: "All the fields are required!",
        });
      }
    } catch (error) {
      return res.send({
        status: "error",
        message: `${error.name}: ${error.message}`,
      });
    }
  };

  /**
   * Retrieves all appointments from the database and sends a response with the appointment data
   * if appointments exist, or an error message otherwise.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  // static get_all_appointments = async (req, res) => {
  //   try {
  //     const appointments = await AppointmentModel.aggregate([
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "user_id",
  //           foreignField: "_id",
  //           as: "userDetails",
  //         },
  //       },
  //       {
  //         $unwind: "$userDetails",
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           user_id: 1,
  //           booking_time: 1,
  //           booking_date: 1,
  //           booking_duration: 1,
  //           total_screen: 1,
  //           status: 1,
  //           verified: 1,
  //           username: "$userDetails.username",
  //         },
  //       },
  //     ]);
  //     if (appointments.length > 0) {
  //       res.send({ status: "success", appointments: appointments });
  //     } else {
  //       res.send({ status: "error", message: "Appointments doesn't exist" });
  //     }
  //   } catch (error) {
  //     res.send({ status: "error", message: `${error.name}: ${error.message}` });
  //   }
  // };

  static get_all_appointments = async (req, res) => {
    try {
      const appointments = await AppointmentModel.find({});
      if (appointments.length > 0) {
        res.send({ status: "success", appointments: appointments });
      } else {
        res.send({ status: "error", message: "Appointments doesn't exist" });
      }
    } catch (error) {
      res.send({ status: "error", message: `${error.name}: ${error.message}` });
    }
  };

  static getAllAppointmentsInDesc = async (req, res) => {
    try {
      const appointments = await AppointmentModel.aggregate([
        {
          $match: {
            status: "Pending",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            booking_name: 1,
            booking_start_time: 1,
            booking_end_time: 1,
            booking_date: 1,
            screen_space: 1,
            total_screen: 1,
            content_description: 1,
            status: 1,
            verified: 1,
            username: { $ifNull: ["$userDetails.username", "User Not Found"] },
          },
        },
        {
          $sort: {
            booking_start_time: -1,
          },
        },
        {
          $limit: 10,
        },
      ]);
      if (appointments.length > 0) {
        res.send({ status: "success", appointments: appointments });
      } else {
        res.send({ status: "error", message: "No Recent Appointment!" });
      }
    } catch (error) {
      res.send({ status: "error", message: error.message });
    }
  };

  /**
   * Retrieves a specific appointment based on the provided appointment ID parameter
   * and sends a response with the appointment data if the appointment exists,
   * or an error message otherwise.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  static get_appointment = async (req, res) => {
    const { appointment_id } = req.params;
    try {
      if (appointment_id) {
        const appointment = await AppointmentModel.findById(appointment_id);
        if (appointment) {
          res.send({ status: "success", appointment: appointment });
        } else {
          res.send({ status: "error", message: "Appointment not found" });
        }
      } else {
        res.send({ status: "error", message: "Invalid Paramaters" });
      }
    } catch (error) {
      res.send({ status: "error", message: `${error.name}: ${error.message}` });
    }
  };

  static verify_appointment = async (req, res) => {
    const { appointment_id, verified } = req.body;
    try {
      if (verified !== undefined && appointment_id) {
        const status = verified ? "Verified" : "Rejected";
        const verify = await AppointmentModel.updateOne(
          { _id: appointment_id },
          { $set: { verified: verified, status: status } }
        );
        if (verify.modifiedCount > 0 && verify.acknowledged) {
          res.send({
            status: "success",
            message: `Appointment ${
              verified ? "verified" : "Rejected"
            } successfully!`,
          });
        } else {
          res.send({
            status: "error",
            message: "Sorry, something went wrong!",
          });
        }
      } else {
        res.send({
          status: "error",
          message: "Invalid Data",
        });
      }
    } catch (error) {
      res.send({
        status: "error",
        message: `${error.name}: ${error.messages}`,
      });
    }
  };

  static get_user_appointment = async (req, res) => {
    const { user_id } = req.params;
    if (user_id) {
      try {
        const appointment = await AppointmentModel.find({ user_id: user_id });
        if (appointment.length > 0) {
          res.send({ status: "success", appointment: appointment });
        } else {
          res.send({ status: "error", message: "No appointment exist!" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    } else {
      res.send({ status: "error", message: "User id required" });
    }
  };

  static getAvailableSlots = async (req, res) => {
    try {
      const { timezone } = req.query; // Get user's timezone from request header
      const userTimezone = timezone;
      const requestTime = moment(); // Get the current date and time of the request
      const startDateTime = requestTime.clone().tz(userTimezone); // Convert to user's timezone
      const endDateTime = startDateTime.clone().add(7, "days"); // Calculate the end date for checking available slots (7 days from the request)

      // Fetch bookings from MongoDB that overlap with the 7-day period
      const bookings = await AppointmentModel.find({
        $or: [
          {
            $and: [
              { booking_start_time: { $lt: endDateTime.toDate() } },
              { booking_end_time: { $gte: startDateTime.toDate() } },
            ],
          },
          {
            $and: [
              { booking_start_time: { $gte: startDateTime.toDate() } },
              { booking_start_time: { $lt: endDateTime.toDate() } },
            ],
          },
        ],
      }).lean();

      // Calculate the available slots
      const availableSlots = [];
      let currentDateTime = startDateTime.clone();
      while (currentDateTime.isBefore(endDateTime)) {
        const slotStart = currentDateTime.format();
        const slotEnd = currentDateTime.add(1, "hour").format();
        const isBooked = bookings.some((booking) => {
          const bookingDateTime = moment
            .tz(booking.booking_start_time, "UTC")
            .format();
          const bookingEndDateTime = moment
            .tz(booking.booking_end_time, "UTC")
            .format();
          return currentDateTime.isBetween(
            bookingDateTime,
            bookingEndDateTime,
            null,
            "[)"
          ); // Exclude the end time of the booking
        });
        if (!isBooked) {
          availableSlots.push({ start: slotStart, end: slotEnd });
        }
      }

      // Convert the slots to the user's timezone
      const slotsInUserTimezone = availableSlots.map((slot) => ({
        start: moment(slot.start).tz(userTimezone).format(),
        end: moment(slot.end).tz(userTimezone).format(),
      }));

      res.send({ status: "success", slots: slotsInUserTimezone });
    } catch (error) {
      res.send({
        status: "error",
        message: error.message,
      });
    }
  };

  static getUpcomingAppointments = async (req, res) => {
    const { user_id } = req.params;
    let requestTime = moment();
    requestTime = requestTime.toISOString();
    if (requestTime && user_id) {
      try {
        const appointments = await AppointmentModel.find({
          user_id: user_id,
          booking_start_time: { $gt: requestTime },
        });
        if (appointments.length > 0) {
          res.send({ status: "success", appointments: appointments });
        } else {
          res.send({ status: "error", message: "No appointment found!" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    }
  };

  static isConflictingAppointment = async (
    appointments,
    screen_space,
    currentTime,
    req,
    res
  ) => {
    let screen_spaces_arr = [];
    let default_spaces = [1, 2, 3, 4, 5];
    for (let i = 0; i < appointments.length; i++) {
      const screenSpaces = appointments[i].screen_space.split(" ");
      for (let j = 0; j < screenSpaces.length; j++) {
        screen_spaces_arr.push(Number(screenSpaces[j]));
      }
    }
    const unique_screen_spaces = [...new Set(screen_spaces_arr)];
    const difference_spaces = default_spaces.filter(
      (element) => !unique_screen_spaces.includes(element)
    );
    const user_spaces = screen_space.split(" ").map((space) => Number(space));
    let isSlotAvailable = user_spaces.every((space) =>
      difference_spaces.includes(space)
    );

    if (!isSlotAvailable && difference_spaces.length > 0) {
      return res.send({
        status: "error",
        message: `Only ${difference_spaces} slots are available at this time!`,
      });
    } else if (difference_spaces.length === 0) {
      return res.send({
        status: "error",
        message: `Slot is not available at this time`,
      });
    } else {
      if (
        !AppointmentController.validateBookingDateTime(
          req.body.booking_start_time,
          req.body.booking_end_time,
          currentTime
        )
      ) {
        return res.send({
          status: "error",
          message: "Invalid date/time select for booking!",
        });
      } else if (
        await AppointmentController.validateBookingCoupon(
          req.body.coupon,
          currentTime
        )
      ) {
        const screen_space_urls = [];
        if (req.body.streaming_urls?.length > 0) {
          req.body.streaming_urls.forEach((url, index) => {
            const screen_space_url_obj = {
              space_screen_id: req.body.screen_space[index].toString(),
              url: url,
            };
            screen_space_urls.push(screen_space_url_obj);
          });
        }
        const appointment = new AppointmentModel({
          user_id: req.body.user_id,
          booking_name: req.body.booking_name,
          booking_start_time: req.body.booking_start_time,
          booking_end_time: req.body.booking_end_time,
          booking_date: req.body.booking_date,
          total_screen: req.body.total_screen || screen_space.split(" ").length,
          screen_space: screen_space,
          streaming_urls: screen_space_urls.length > 0 ? screen_space_urls : [],
          content_description: req.body.content_description,
          coupon: req.body.coupon || "",
        });
        await appointment
          .save()
          .then(() => {
            return res.send({
              status: "success",
              message: "Appointment booked successfully",
            });
          })
          .catch((err) => {
            return res.send({
              status: "error",
              message: `${err.name}: ${err.message}`,
            });
          });
      } else {
        res.send({ status: "error", message: "Invalid Coupon!" });
      }
    }
  };

  static validateBookingCoupon = async (coupon, currentTime) => {
    if (coupon) {
      const isCouponExist = await CouponModel.findOne({
        coupon: coupon,
      });
      const expiry = new Date(isCouponExist.coupon_expiry_time).toISOString();
      if (isCouponExist === null || currentTime > expiry) {
        return false;
      }
    }
    return true;
  };

  static validateBookingDateTime = (
    booking_start_time,
    booking_end_time,
    currentTime
  ) => {
    if (
      booking_start_time < currentTime ||
      booking_end_time < currentTime ||
      booking_end_time == booking_start_time
    ) {
      return false;
    }
    return true;
  };

  static dummyAppointment = (req, res) => {
    try {
      const appointment_dummy_data = {
        _id: "662a598f5ab75b956f6d876f",
        user_id: "65bb9da0e3a956eeb6ca9e40",
        booking_start_time: "2024-04-27T13:24:00.000Z",
        booking_end_time: "2024-04-27T16:27:00.000Z",
        booking_date: "2024-04-27",
        total_screen: 5,
        screen_space: [1, 2, 3, 4, 5],
        streaming_urls: [
          {
            space_screen_id: "1",
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          },
          {
            space_screen_id: "2",
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          },
          {
            space_screen_id: "3",
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          },
          {
            space_screen_id: "4",
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          },
          {
            space_screen_id: "5",
            url: "https://sample-videos.com/img/Sample-jpg-image-50kb.jpg",
          },
        ],
        coupon: "",
        status: "Pending",
        verified: true,
        createdAt: "2024-04-25T13:24:31.884Z",
        updatedAt: "2024-04-25T13:24:31.884Z",
      };
      return res.send({
        status: "success",
        appointment: appointment_dummy_data,
      });
    } catch (error) {
      return res.send({ status: "error", message: error.message });
    }
  };
}

export default AppointmentController;
