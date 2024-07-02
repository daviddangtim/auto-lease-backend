import express from "express";
import * as carController from "../controllers/carController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();
const { DEALER } = ROLES;

router.route("/").post(protect, restrictTo(DEALER), carController.createCar);

export default router;
