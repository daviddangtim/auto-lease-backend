import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.patch("/update-me", userController.updateMe);
router.patch("/delete-me", userController.deleteMe);
router.patch("update-password", userController.updateMyPassword);
router.patch("update-profile-photo", userController.updateProfilePhoto);

export default router;
