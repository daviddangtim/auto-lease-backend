import express from "express";
import * as userController from "../controllers/userController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router({ mergeParams: true });
const { USER } = ROLES;

router.use(protect);

router.patch("/apply", restrictTo(USER), userController.applyForDealership);

router.patch("/updateMe", userController.updateMe);
router.patch("/deleteMe", userController.deleteMe);
router.patch("/updateMyPassword", userController.updateMyPassword);
router.patch("/updateMyProfilePhoto", userController.updateProfilePhoto);

export default router;
