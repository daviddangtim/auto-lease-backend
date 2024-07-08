import express from "express";
import me from "../middlewares/me.js";
import userRouter from "./userRouter.js";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";
import * as dealershipController from "../controllers/dealershipController.js";

const router = express.Router();
const { ADMIN, USER, DEALER } = ROLES;

router.use("/users", protect, restrictTo(USER, ADMIN), userRouter);

router.get("/public", dealershipController.getAllDealerships);
router.get("/public/:id", dealershipController.getDealership);

router.use(protect);

router
  .route("/")
  .get(restrictTo(ADMIN), dealershipController.getAllDealerships);

router
  .route("/:id")
  .post(restrictTo(ADMIN), dealershipController.createDealership)
  .get(restrictTo(ADMIN, DEALER), dealershipController.getDealership);

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
