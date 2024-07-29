import express from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middlewares/guard.js";
import { upload } from "../utils/imageUploader.js";
import { uploadFrontOfId, uploadBackOfId } from "../middlewares/x.js";

const router = express.Router();

router.post("/sign-up", upload.fields(
    [{ name: "frontOfId", maxCount: 1 },
    { name: "backofId", maxCOunt: 1 }]
  ), uploadFrontOfId, uploadBackOfId,authController.signUp);
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
