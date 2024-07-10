import express from "express";
import * as adminController from "../controllers/adminController.js";
import dealershipRouter from "./dealershipRouter.js";

const router = express.Router();

router.use("/dealerships", dealershipRouter);

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

// http://127.0.0.1:3000/admin/dealership
