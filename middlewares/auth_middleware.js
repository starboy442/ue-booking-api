import { auth_validator } from "../utils/Validators.js";
import jwt from "jsonwebtoken";

const register_middleware = (model) => {
  return async (req, res, next) => {
    try {
      let isValid = false;
      if (model === "admin") {
        const { username, email, role, password } = req.body;
        const response = await auth_validator(
          username,
          email,
          password,
          model,
          res,
          role
        );
        isValid = response;
      } else {
        const { username, email, password } = req.body;
        const response = await auth_validator(
          username,
          email,
          password,
          model,
          res
        );
        isValid = response;
      }
      if (isValid) {
        next();
      }
    } catch (error) {
      res.send({
        status: "error",
        message: error.message,
      });
    }
  };
};

const authenticate_middleware = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if ((username || email) && password) {
      next();
    } else {
      return res.send({
        status: "error",
        message: "All the fields are required",
      });
    }
  } catch (error) {
    res.send({ status: "error", message: error.message });
  }
};

const authorize_middleware = (model) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    try {
      let token;
      if (authorization && authorization.startsWith("Bearer")) {
        token = authorization.split(" ")[1];
        const decodedToken = jwt.decode(token, { complete: true });
        if (decodedToken && decodedToken.payload.exp * 1000 < Date.now()) {
          return res.send({ status: "failed", message: "Token has expired" });
        }
        const { id } = jwt.verify(token, process.env.SECRET_KEY);
        req.user = await model.findById(id).select("-password");
        next();
      }
    } catch (error) {
      res.send({ status: "error", message: error.message });
    }
  };
};

export { register_middleware, authenticate_middleware, authorize_middleware };
