import express from "express";
import * as dealershipController from "../controllers/dealershipController.js";
import userRouter from "./userRouter.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router();
const { ADMIN, USER, DEALER } = ROLES;

router
  .route("/")
  .get(dealershipController.getAllDealerships)
  .post(protect, restrictTo(DEALER), dealershipController.createDealership);

router.get(
  "/restricted",
  protect,
  restrictTo(ADMIN),
  dealershipController.getAllDealerships,
);

router.get(
  "/restricted/:id",
  restrictTo(ADMIN, DEALER),
  dealershipController.getDealership,
);

router
  .route("/:id")
  .get(dealershipController.getDealership)
  .post(protect, restrictTo(ADMIN), dealershipController.createDealership);

router.use(protect);

router.use(
  "/users",
  restrictTo(USER),
  dealershipController.createMyDealership,
  dealershipController.createDealership,
  userRouter,
);

router.patch(
  "/updateMyDealership",
  protect,
  restrictTo(DEALER),
  dealershipController.updateMyDealership,
);

router.patch(
  "/updateMyDealership/certificates",
  restrictTo(DEALER),
  dealershipController.updateMyDealershipCerts,
);

export default router;
