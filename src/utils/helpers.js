import crypto from "node:crypto";
import { promisify } from "node:util";

export const catchAsync = (cb) => (req, res, next) =>
  cb(req, res, next).catch(next);

export const baseUrl = (req) => `${req.protocol}://${req.get("host")}/api/v1`;

export const isProduction = process.env.NODE_ENV === "production";

export const createHash = (data) =>
  crypto.createHash("sha256").update(data).digest("hex");

export const createRandomBytes = async (len) =>
  (await promisify(crypto.randomBytes)(len)).toString("hex");

export const filterObject = (object, keys, { exclude = false } = {}) =>
  Object.keys(object).reduce((acc, key) => {
    if (exclude) {
      if (!keys.includes(key)) {
        acc[key] = object[key];
      }
    } else {
      if (keys.includes(key)) {
        acc[key] = object[key];
      }
    }
    return acc;
  }, {});

export const generateOtp = (len) => {
  let otp = "";
  for (let i = 0; i < len; i++) {
    otp += crypto.randomInt(0, 9);
  }
  return otp;
};

export const limitArrayLength =
  (max = 0, min = 0) =>
  (value) => {
    if (!Array.isArray(value)) return false;
    const len = value.length;
    return len >= min && len <= max;
  };

export const createTimeStampInEpoch = (options = {}) => {
  const { s = 0, m = 0, h = 0, d = 0, w = 0, mt = 0, y = 0 } = options;

  if (
    typeof s !== "number" ||
    typeof m !== "number" ||
    typeof h !== "number" ||
    typeof d !== "number" ||
    typeof w !== "number" ||
    typeof mt !== "number" ||
    typeof y !== "number"
  ) {
    throw new TypeError("All options must be numbers");
  }

  const MILLISECOND = 1000;
  const MINUTE = 60 * MILLISECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  return (
    Date.now() +
    s * MILLISECOND +
    m * MINUTE +
    h * HOUR +
    d * DAY +
    w * WEEK +
    mt * MONTH +
    y * YEAR
  );
};
