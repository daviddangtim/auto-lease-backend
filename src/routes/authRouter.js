import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.patch("/sign-in/2fa-verify", authController.verify);
router.patch("/confirm-user/:token", authController.confirmUser);
router.patch("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch(
  "/request-confirmation-token",
  authController.requestConfirmationToken,
);

export default router;
