import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router
  .route("/")
  .post(adminController.createUser)
  .get(adminController.getAllUsers)
  .delete(adminController.deleteManyUsers);

router
  .route("/:id")
  .delete(adminController.deleteUser)
  .get(adminController.getUser)
  .patch(adminController.updateUser);

export default router;
