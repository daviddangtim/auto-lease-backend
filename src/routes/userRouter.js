import express from "express";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";
import * as controller from "../controllers/userController.js";

const router = express.Router({ mergeParams: true });
const { USER, ADMIN } = ROLES;

router.use(protect);

router.post("/apply", restrictTo(USER), controller.applyForDealership);
router.patch("/approve/:id", restrictTo(ADMIN), controller.approveDealership);
router.patch("/reject/:id", restrictTo(ADMIN), controller.rejectDealership);
router.patch("/revoke/:id", restrictTo(ADMIN), controller.revokeDealership);

router.patch("/update/me", controller.updateMe);
router.patch("/delete/me", controller.deleteMe);
router.patch("/update-Password/me", controller.updateMyPassword);
router.patch("/update-photo/me", controller.updateProfilePhoto);

export default router;
