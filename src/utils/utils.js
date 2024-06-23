import { sign } from "./jwt.js";

export const catchAsync = (cb) => (req, res, next) =>
  cb(req, res, next).catch(next);

export const filterObject = (object, ...keys) =>
  Object.keys(object).reduce((acc, key) => {
    if (keys.includes(key)) {
      acc[key] = object[key];
    }
    return acc;
  }, {});

export const sendToken = async (user, res, statusCode = 200) =>
  res.json({
    token: await sign(user._id),
    statusText: "success",
    data: { user },
  });

export const handleUncaughtException = () =>
  process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION 🧨 Shutting down");
    process.exit(1);
  });

export const handleUnhandledRejection = (server) =>
  process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    console.log("UNHANDLED REJECTION 🧨 Shutting down");
    server.close(() => {
      process.exit(1);
    });
  });

export const createTimeStampInEpoch = ({
  sec = 0,
  min = 0,
  hr = 0,
  day = 0,
  week = 0,
  month = 0,
  year = 0,
} = {}) => {
  if (
    typeof sec !== "number" ||
    typeof min !== "number" ||
    typeof hr !== "number" ||
    typeof day !== "number" ||
    typeof week !== "number" ||
    typeof month !== "number" ||
    typeof year !== "number"
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
    sec * MILLISECOND +
    min * MINUTE +
    hr * HOUR +
    day * DAY +
    week * WEEK +
    month * MONTH +
    year * YEAR
  );
};
