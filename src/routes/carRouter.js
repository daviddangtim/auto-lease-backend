import express from "express";
import * as carController from "../controllers/carController.js";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";
import { uploadMultiple } from "../utils/imageUploader.js";
import {
  setCoverAndPhotos,
  setCreateCoverImage,
  setUpdateCoverImage,
} from "../middlewares/x.js";
import Car from "../models/carModel.js";

const router = express.Router({ mergeParams: true });
const { DEALER, ADMIN } = ROLES;

router
  .route("/")
  .post(
    protect,
    restrictTo(DEALER, ADMIN),
    carController.setDealershipId,
    setCoverAndPhotos(),
    setCreateCoverImage,
    uploadMultiple,
    carController.createCar,
  )
  .get(carController.getAllCars);

router
  .route("/:id")
  .get(carController.getCar)
  .delete(protect, restrictTo(ADMIN, DEALER), carController.deleteCar)
  .patch(
    protect,
    restrictTo(ADMIN, DEALER),
    carController.setDealershipId,
    setCoverAndPhotos(),
    setUpdateCoverImage(Car),
    uploadMultiple,
    carController.updateCar,
  );

export default router;
