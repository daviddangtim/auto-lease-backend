import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middlewares/guard.js";
import { ROLES } from "../utils/constants.js";

const router = express.Router({ mergeParams: true });
const { USER, ADMIN } = ROLES;

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    protect,
    restrictTo(USER),
    reviewController.setCarUserIds,
    reviewController.createReview,
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(protect, restrictTo(ADMIN), reviewController.deleteReview)
  .patch(protect, restrictTo(USER, ADMIN), reviewController.updateReview);

export default router;
