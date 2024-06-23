import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.patch("/update-me", userController.updateMe);
router.patch("/delete-me", userController.deleteMe);
router.patch("update-password", userController.updateMyPassword);
router.patch("update-profile-photo", userController.updateProfilePhoto);

router
  .route("/")
  .post(userController.createUser)
  .get(userController.getAllUsers)
  .delete(userController.deleteManyUsers);

router
  .route("/:id")
  .delete(userController.deleteUser)
  .get(userController.getUser)
  .patch(userController.updateUser);

export default router;
