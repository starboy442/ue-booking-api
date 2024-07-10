import AdminModel from "../models/admin/AdminModel.js";
import UserModel from "../models/user/UserModel.js";

const validate_username = (username) => {
  if (username.length > 0 && typeof username === "string") {
    const pattern = /^[a-zA-Z0-9_]+$/;
    if (pattern.test(username)) {
      return true;
    }
  }
  return false;
};

const validate_email = (email) => {
  if (email.length > 0 && typeof email === "string") {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    if (pattern.test(email)) {
      return true;
    }
  }
  return false;
};

const validate_role = (role) => {
  if (role.length > 0 && typeof role === "string") {
    if (role === "admin" || role === "user") {
      return true;
    }
  }
  return false;
};

const validate_password = (password) => {
  if (password.length > 0 && typeof password === "string") {
    if (password.length >= 8) {
      return true;
    }
  }
  return false;
};

const auth_validator = async (
  username,
  email,
  password,
  model,
  res,
  role = null
) => {
  if (username && email && password) {
    let isValid = true;
    const exist_username =
      model === "admin"
        ? await AdminModel.findOne({ username: username })
        : await UserModel.findOne({ username: username });
    const exist_email =
      model === "admin"
        ? await AdminModel.findOne({ email: email })
        : await UserModel.findOne({ email: email });
    if (!validate_username(username)) {
      res.send({
        status: "error",
        message:
          "Invalid Username: username contain only letters, underscore and numbers",
      });
    } else if (!validate_email(email)) {
      res.send({
        status: "error",
        message: "Invalid Email",
      });
    } else if (!validate_password(password)) {
      res.send({
        status: "error",
        message:
          "Invalid Password: Password should be at least 8 character long",
      });
    } else if (role && !validate_role(role)) {
      res.send({
        status: "error",
        message: "Invalid Role: Role should be admin or user",
      });
    } else if (exist_username && username === exist_username.username) {
      res.send({
        status: "error",
        message: "Username already exist",
      });
    } else if (exist_email && email === exist_email.email) {
      res.send({ status: "error", message: "Email already exist" });
    } else {
      return isValid;
    }
  } else {
    return res.send({
      status: "error",
      message: "All the fields are required",
    });
  }
};

export {
  validate_username,
  validate_password,
  validate_email,
  validate_role,
  auth_validator,
};
