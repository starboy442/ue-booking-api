import AdminModel from "../../models/admin/AdminModel.js";
import UserModel from "../../models/user/UserModel.js";
import AppointmentModel from "../../models/Appointment/AppointmentModel.js";
import ReportModel from "../../models/Report/ReportModel.js";
import { encrypt_password, comapre_password } from "../../utils/Functions.js";
import jwt from "jsonwebtoken";
import transporter from "../../config/email_config.js";

class AuthController {
  /**
   * Returns a middleware function that retrieves all users from the specified model
   * and sends a response with the user data if they exist, or an error message otherwise.
   *
   * @param {Object} model - Mongoose model representing the user schema.
   * @returns {Function} - Express middleware function that handles the retrieval of all users.
   */
  static users = (model) => {
    return async (req, res) => {
      try {
        const users = await model.find({});
        if (users.length > 0) {
          res.send({ status: "success", users: users });
        } else {
          res.send({ status: "error", message: "Users not exist!" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    };
  };

  /**
   * Returns a middleware function that retrieves a specific user based on the provided
   * user ID parameter from the specified model. Sends a response with the user data if
   * the user exists, or an error message otherwise.
   *
   * @param {Object} model - Mongoose model representing the user schema.
   * @returns {Function} - Express middleware function that handles the retrieval of a specific user.
   */
  static user = (model) => {
    return async (req, res) => {
      const { user_id } = req.params;
      try {
        if (user_id) {
          const user = await model.findById(user_id);
          if (user) {
            res.send({ status: "success", user: user });
          } else {
            res.send({ status: "error", message: "User not found!" });
          }
        } else {
          res.send({ status: "error", message: "Invalid Parameters" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    };
  };

  /**
   * Returns a middleware function that handles the registration of a new user based on
   * the specified model. Validates the request body and creates a new user instance,
   * then saves the user to the database and sends a response with the user details if
   * successful, or an error message otherwise.
   *
   * @param {Object} model - Mongoose model representing the user schema (AdminModel or UserModel).
   * @returns {Function} - Express middleware function that handles user registration.
   */
  static register = (model) => {
    return async (req, res) => {
      try {
        let fields;
        let new_user = null;
        if (model === "admin") {
          const { username, email, role, password } = req.body;
          fields = { username, email, role, password };
        } else {
          const { username, email, password } = req.body;
          fields = { username, email, password };
        }
        const hash_password = await encrypt_password(fields.password);
        if (model === "admin") {
          new_user = new AdminModel({
            username: fields.username,
            email: fields.email,
            role: fields.role,
            password: hash_password,
          });
        } else {
          new_user = new UserModel({
            username: fields.username,
            email: fields.email,
            password: hash_password,
          });
        }
        await new_user
          .save()
          .then((user) => {
            res.send({
              status: "success",
              message: "Account created successfully!",
              user: user,
            });
          })
          .catch((error) => {
            res.send({
              status: "error",
              message: error.message,
            });
          });
      } catch (error) {
        res.send({ status: "Register error", message: error.message });
      }
    };
  };

  /**
   * Returns a middleware function that handles user authentication based on the specified model.
   * Validates the provided username or email and password, compares the password hash,
   * generates a JWT token for authorization, and sends a response with the user details and token
   * if authentication is successful, or an error message otherwise.
   *
   * @param {Object} model - Mongoose model representing the user schema.
   * @returns {Function} - Express middleware function that handles user authentication.
   */
  static authenticate = (model) => {
    return async (req, res) => {
      const { username, email, password } = req.body;
      try {
        const user = await model.findOne({
          $or: [{ username: username }, { email: email }],
        });
        if (user) {
          const verify_password = await comapre_password(
            password,
            user.password
          );
          if (verify_password) {
            const expiresIn = 7 * 24 * 60 * 60;
            const token = jwt.sign(
              {
                id: user._id,
              },
              process.env.SECRET_KEY,
              { expiresIn: expiresIn }
            );
            res.send({
              status: "success",
              message: "Login Successfully",
              user: user,
              token: token,
            });
          } else {
            res.send({
              status: "error",
              message: `Wrong ${username ? "username" : "email"} or password`,
            });
          }
        } else {
          res.send({ status: "error", message: "User Not Found" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    };
  };

  /**
   * Checks if the incoming request is from an authorized user with a valid JWT token.
   * If authorized, sends a success response with user details. Otherwise, sends an
   * error response indicating an unauthorized user.
   *
   * @param {Object} req - Express request object containing the user information extracted
   *                      from the JWT token (if present).
   * @param {Object} res - Express response object used to send success or error messages.
   */
  static authorized = async (req, res) => {
    if (req.user) {
      res.send({ status: "success", user: req.user });
    } else {
      res.send({ status: "error", message: "Unauthorized User" });
    }
  };

  /**
   * Returns a middleware function that handles updating the password for the currently
   * authenticated user based on the specified model. Validates the new password and
   * confirmation, encrypts the new password, and updates the password in the database.
   *
   * @param {Object} model - Mongoose model representing the user schema.
   * @returns {Function} - Express middleware function that handles password update.
   */
  static update_password = (model) => {
    return async (req, res) => {
      const { password, confirm_password } = req.body;
      try {
        if (password && confirm_password && req.user) {
          if (password === confirm_password) {
            const hash_password = await encrypt_password(password);
            const user = await model.findOne({ _id: req.user._id });
            if (user) {
              const change_password = await model.updateOne(
                { _id: user._id },
                { $set: { password: hash_password } }
              );
              if (
                change_password.modifiedCount > 0 &&
                change_password.acknowledged
              ) {
                res.send({
                  status: "success",
                  message: "Password changed successfully!",
                });
              } else {
                res.send({
                  status: "error",
                  message: "Password did not changed!",
                });
              }
            }
          } else {
            res.send({ status: "error", message: "Passwords do not match" });
          }
        } else {
          res.send({ status: "error", message: "All Fields are required" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    };
  };

  /**
   * Returns a middleware function that handles sending a password reset link to the provided
   * email address based on the specified model. Generates a JWT token with a short expiration
   * time, constructs a password reset link, sends an email to the user, and sends a response
   * with the reset link if successful, or an error message otherwise.
   *
   * @param {Object} model - Mongoose model representing the user schema.
   * @returns {Function} - Express middleware function that handles sending password reset link.
   */
  static send_reset_link_mail = (model) => {
    return async (req, res) => {
      const { email } = req.body;
      try {
        if (email) {
          const user = await model.findOne({ email: email });
          if (user) {
            const secret_key = user._id + process.env.SECRET_KEY;
            const token = jwt.sign(
              {
                id: user._id,
              },
              secret_key,
              { expiresIn: "10m" }
            );
            const link = `http://127.0.0.1:8000/auth/reset/${user._id}/${token}`;
            await transporter.sendMail({
              from: process.env.EMAIL_FROM,
              to: user.email,
              subject: "Password Reset Link",
              html: `<a href="${link}">Reset Password</a>`,
            });
            res.send({
              status: "success",
              message: "Password reset link sent to your email",
              link: link,
            });
          } else {
            res.send({ status: "error", message: "Email doesn't exist" });
          }
        } else {
          res.send({ status: "error", message: "Email field is required" });
        }
      } catch (error) {
        res.send({ status: "error", message: error.message });
      }
    };
  };

  /**
   * Returns a middleware function that handles resetting the password for a user
   * based on the specified model. Verifies the reset token's authenticity, checks
   * the provided password and confirmation, then updates the password in the database.
   *
   * @param {Object} model - Mongoose model representing the user schema.
   * @returns {Function} - Express middleware function that handles password reset.
   */
  static reset_password = (model) => {
    return async (req, res) => {
      const { password, confirm_password } = req.body;
      const { id, token } = req.params;
      const user = await model.findById(id);
      if (user) {
        const new_secret = user._id + process.env.SECRET_KEY;
        try {
          jwt.verify(token, new_secret);
          if (password && confirm_password) {
            if (password === confirm_password) {
              const hash_password = await encrypt_password(password);
              await model.findByIdAndUpdate(user._id, {
                $set: { password: hash_password },
              });
              res.send({
                status: "success",
                message: "Password reset successfully",
              });
            } else {
              res.send({
                status: "error",
                message: "Confirm Password didn't match",
              });
            }
          } else {
            res.send({ status: "error", message: "Both field are required" });
          }
        } catch (error) {
          res.send({ status: "error", message: error.message });
        }
      }
    };
  };

  static delete_user = (model) => {
    return async (req, res) => {
      const { user_id } = req.params;
      if (user_id) {
        try {
          const user = await model.findById(user_id);
          if (user) {
            const users_appointments = await AppointmentModel.find({
              user_id: user_id,
            });
            if (users_appointments.length > 0) {
              await AppointmentModel.deleteMany({
                user_id: user_id,
              });
            }
            await model
              .findByIdAndDelete(user_id)
              .then(() => {
                res.send({
                  status: "success",
                  message: "User Deleted Successfully",
                });
              })
              .catch((error) => {
                res.send({ status: "error", message: error.message });
              });
          }
        } catch (error) {
          res.send({ status: "error", message: error.message });
        }
      } else {
        res.send({ status: "error", message: "User Id Required!" });
      }
    };
  };

  static banned_user = async (req, res) => {
    const { banned_user_id } = req.body;
    if (banned_user_id !== undefined) {
      try {
        const banned_user = await UserModel.updateOne(
          {
            _id: banned_user_id,
          },
          {
            $set: { banned: true },
          }
        );
        if (banned_user.modifiedCount > 0) {
          const delete_from_reported_users = await ReportModel.deleteMany({
            reported_user_id: banned_user_id,
          });
          return res.send({
            status: "success",
            message: "User Banned Successfully!",
          });
        } else {
          return res.send({
            status: "error",
            message: "Sorry, something went wrong!",
          });
        }
      } catch (error) {
        return res.send({
          status: "error",
          message: error.message,
        });
      }
    } else {
      return res.send({ status: "success", message: "Invalid banned_user_id" });
    }
  };
  static un_banned_user = async (req, res) => {
    const { banned_user_id } = req.body;
    if (banned_user_id !== undefined) {
      try {
        const banned_user = await UserModel.updateOne(
          {
            _id: banned_user_id,
          },
          {
            $set: { banned: false },
          }
        );
        if (banned_user.modifiedCount > 0) {
          return res.send({
            status: "success",
            message: "User Unbanned Successfully!",
          });
        } else {
          return res.send({
            status: "error",
            message: "Sorry, something went wrong!",
          });
        }
      } catch (error) {
        return res.send({
          status: "error",
          message: error.message,
        });
      }
    } else {
      return res.send({
        status: "success",
        message: "Invalid un_banned_user_id",
      });
    }
  };

  static getBannedUsers = async (req, res) => {
    try {
      const banned_users = await UserModel.find({
        banned: true,
      });
      if (banned_users.length > 0) {
        return res.send({ status: "success", banned_users: banned_users });
      } else {
        return res.send({ status: "error", message: "No banned user found!" });
      }
    } catch (error) {
      return res.send({ status: "error", message: error.message });
    }
  };
}

export default AuthController;
