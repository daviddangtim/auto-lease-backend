import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middlewares/guard.js";

const router = express.Router();

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.signIn);
router.patch("/2fa", authController.signIn2fa);
router.patch("/verify/:token", authController.verifyUser);
router.patch("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch("/request/token", authController.requestConfirmationToken);
router.patch(
  "/request/token/logged-in",
  protect,
  authController.requestConfirmationToken,
);

export default router;
