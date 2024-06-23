export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode || 500;
    this.statusText = `${this.statusCode}`.startsWith("4")
      ? "fail"
      : "Internal Server Error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
