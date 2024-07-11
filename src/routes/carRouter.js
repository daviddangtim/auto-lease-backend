import express from "express";
import * as controller from "../controllers/carController.js";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router({ mergeParams: true });
const { DEALER, ADMIN } = ROLES;

router
  .route("/")
  .post(
    protect,
    restrictTo(DEALER, ADMIN),
    controller.setDealershipId,
    controller.createCar,
  )
  .get(controller.getAllCars);

router
  .route("/:id")
  .get(controller.getCar)
  .delete(protect, restrictTo(ADMIN, DEALER), controller.deleteCar)
  .patch(protect, restrictTo(ADMIN, DEALER), controller.updateCar);

export default router;
