import express from "express";
import * as reviewController from "../controllers/reviewController.js";
const router = express.Router();

router
  .route("/")
  .post(reviewController.createReview)
  .get(reviewController.getAllReviews);

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateMyReview);
export default router;
