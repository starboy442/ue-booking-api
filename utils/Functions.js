import bcrypt from "bcrypt";
import { time } from "console";
import crypto from "crypto";
import moment from "moment-timezone";

const generateSecretKey = () => {
  return crypto.randomBytes(32).toString("hex");
};

const encrypt_password = async (password) => {
  const salt = await bcrypt.genSalt(16);
  const hash_password = await bcrypt.hash(password, salt);
  return hash_password;
};

const comapre_password = async (password, user_password) => {
  const compare_password = await bcrypt.compare(password, user_password);
  return compare_password;
};

const debug = (message, value) => {
  if (message) {
    console.log(message, value);
  } else {
    console.log(value);
  }
};

const isISOTime = (timeString) => {
  const parsedTime = moment(timeString, "HH:mm", true);
  return parsedTime.isValid();
};

export {
  encrypt_password,
  comapre_password,
  generateSecretKey,
  debug,
  isISOTime,
};
