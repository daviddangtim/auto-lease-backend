import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { ROLES } from "../utils/constants.js";
const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo(ROLES.USER), reviewController.createReview)
  .get(reviewController.getAllReviews);

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateMyReview);
export default router;
