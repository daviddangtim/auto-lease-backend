import Review from "../models/reviewModel.js";
import { catchAsync, filterObject } from "../utils/utils.js";
import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";

export const createReview = catchAsync(async (req, res, next) => {
  const payload = filterObject(req.body, ["isUpdated"], { exclude: true });
  payload.user = req.user?._id;
  const review = await Review.create(payload);

  res.status(201).json({
    statusText: "success",
    data: { review },
  });
});

export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).exec();

  if (!review) {
    return next(new AppError("No review found with this ID", 404));
  }

  res.status(200).json({
    statusText: "success",
    data: { review },
  });
});

export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await new AppQueries(req.query, Review.find())
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .query.exec();

  res.status(200).json({
    statusText: "success",
    numResult: reviews.length,
    data: { reviews },
  });
});

export const updateMyReview = catchAsync(async (req, res, next) => {
  const payload = filterObject(req.body, ["review"]);
  // const review
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const deleteReview = await Review.findByIdAndDelete(req.params.id, {
    lean: true,
  }).exec();

  if (!deleteReview) {
    return next(new AppError("No review found with this ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: { deleteReview },
  });
});
