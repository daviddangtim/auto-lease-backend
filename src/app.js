// LIB IMPORTS
import express from "express";
import bodyParser from "express";
import morgan from "morgan";

// PROJECT IMPORTS
import AppError from "./utils/appError.js";
import globalError from "./controllers/errorController.js";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import dealershipRoute from "./routes/dealershipRoute.js";

const app = express();

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/dealership", dealershipRoute);

app.all("*", (req, res, next) => {
  return next(new AppError(`${req.originalUrl} is not on this server`, 404));
});

app.use(globalError);

export default app;
