import express from "express";
import * as carController from "../controllers/carController.js";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";
import {upload, uploadMultiple} from "../utils/imageUploader.js";

const router = express.Router();
const { DEALER } = ROLES;

router.route("/").post(  protect,upload.array("photos",10),uploadMultiple,carController.createCar).get(carController.getCars);
router.route("/:id").get(carController.getCar).patch(upload.array("photos",10),carController.updateCar);

export default router;
