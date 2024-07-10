import express from "express";
import me from "../middlewares/me.js";
import userRouter from "./userRouter.js";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";
import * as dealershipController from "../controllers/dealershipController.js";

const router = express.Router();
const { ADMIN, USER, DEALER } = ROLES;

router.use("/users", protect, restrictTo(USER, ADMIN), userRouter);

router
  .route("/")
  .get(dealershipController.getAllDealerships)
  .post(protect, restrictTo(ADMIN), dealershipController.createDealership);

router
  .route("/:id")
  .post(protect, restrictTo(ADMIN), dealershipController.createDealership)
  .get(dealershipController.getDealership);

router.use(protect);

router.patch(
  "/update/me",
  restrictTo(DEALER),
  me,
  dealershipController.updateDealership,
);

router.patch(
  "/update/certificates/me",
  restrictTo(DEALER),
  me,
  dealershipController.updateDealershipCerts,
);

export default router;
