import express from "express";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";
import {
  applyForDealership,
  approveDealership,
  deleteMe,
  rejectDealership,
  revokeDealership,
  updateMe,
  updateMyPassword,
  updateProfilePhoto,
} from "../controllers/userController.js";

const router = express.Router({ mergeParams: true });
const { USER, ADMIN } = ROLES;

router.use(protect);

router.post("/apply", restrictTo(USER), applyForDealership);
router.patch("/approve/:id", restrictTo(ADMIN), approveDealership);
router.patch("/reject/:id", restrictTo(ADMIN), rejectDealership);
router.patch("/revoke/:id", restrictTo(ADMIN), revokeDealership);

router.patch("/update/me", updateMe);
router.patch("/delete/me", deleteMe);
router.patch("/update-Password/me", updateMyPassword);
router.patch("/update-photo/me", updateProfilePhoto);

export default router;
