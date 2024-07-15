import cloneDeep from "clone-deep";
import AppError from "../utils/appError.js";

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      statusText: err.statusText,
      message: err.message,
    });
  } else {
    res.status(500).json({
      statusText: "Internal Server Error",
      message: "Something went very wrong💥💥",
    });
  }
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    statusText: err.statusText,
    error: err,
    name: err.name,
    message: err.message,
    stack: err.stack,
    isOperational: err.isOperational,
  });
};

const handleDbValidationError = (err) => {
  const message = Object.keys(err.errors)
    .map((key) => err.errors[key].message)
    .join(". ");
  return new AppError(message, 400);
};

const handleDbDuplicateError = (err) => {
  const keyValueEntries = Object.entries(err.keyValue);
  if (keyValueEntries.length === 1) {
    const [key, value] = keyValueEntries[0];
    return new AppError(
      `The ${key} ${value} is already in use. Please choose a different ${key}.`,
      400,
    );
  } else if (keyValueEntries.length > 1) {
    const duplicateFields = keyValueEntries.map(([key]) => key).join(", ");
    return new AppError(
      `Duplicate values found in fields: ${duplicateFields}. Please ensure unique values for these fields.`,
      400,
    );
  } else {
    // Handle unexpected case where keyValue is empty or not an object
    return new AppError("Duplicate key error", 400);
  }
};

const handleDbCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDbInclusionError = (err) => new AppError(err.message, 400);

const handleDbMongoServerSelectionError = (err) =>
  new AppError(err.message, 500);

const handleJsonWebTokenError = () => {
  return new AppError("Invalid token. Log in to gain access", 401);
};

const handleTokenExpiredError = () => {
  return new AppError("Token expired. Log in to gain access", 401);
};

const globalError = (err, req, res, next) => {
  console.log("This stupid error was passed heere");
  err.statusCode = err.statusCode || 500;
  err.statusText = err.statusText || "error";

  try {
    if (process.env.NODE_ENV === "development") {
      sendDevError(err, res);
    } else {
      let cloneErr = cloneDeep(err);

      if (cloneErr.name === "ValidationError") {
        cloneErr = handleDbValidationError(cloneErr);
      } else if (cloneErr.code === 11000) {
        cloneErr = handleDbDuplicateError(cloneErr);
      } else if (cloneErr.code === 31254) {
        cloneErr = handleDbInclusionError(cloneErr);
      } else if (cloneErr.name === "CastError") {
        cloneErr = handleDbCastError(cloneErr);
      } else if (cloneErr.name === "JsonWebTokenError") {
        cloneErr = handleJsonWebTokenError();
      } else if (cloneErr.name === "TokenExpiredError") {
        cloneErr = handleTokenExpiredError();
      } else if (cloneErr.name === "MongoServerSelectionError") {
        cloneErr = handleDbMongoServerSelectionError(cloneErr);
      }
      sendProdError(cloneErr, res);
    }
  } catch (err) {
    console.log(err);
    console.log("This erorr is more than we can handle");
  }
};

export default globalError;
