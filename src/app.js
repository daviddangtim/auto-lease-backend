// LIB IMPORTS
import express from "express";
import bodyParser from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

// PROJECT IMPORTS
import AppError from "./utils/appError.js";
import globalError from "./controllers/errorController.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import dealershipRoute from "./routes/dealershipRoute.js";
import adminRoute from "./routes/adminRoute.js";
import carRoute from "./routes/carRoute.js";

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: `To many request from this IP, please try again in an hour`,
});

app.use(helmet());
app.use("/api", limiter);
app.use(bodyParser.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/dealership", dealershipRoute);
app.use("/api/v1/car", carRoute);

app.all("*", (req, res, next) => {
  return next(new AppError(`${req.originalUrl} is not on this server`, 404));
});

app.use(globalError);

export default app;
