import AppError from "../utils/appError.js";
import AppQueries from "../utils/appQueries.js";
import { catchAsync, filterObject } from "../utils/utils.js";
import Review from "../models/reviewModel.js";
import Dealership from "../models/dealershipModel.js";

export const createReview = catchAsync(async (req, res, next) => {
  const payload = filterObject(req.body, ["isUpdated"], { exclude: true });
  payload.user = req.user?._id;

  const dealership = await Dealership.findById(
    payload.dealership,
    {},
    { lean: true },
  ).exec();

  if (!dealership) {
    return next(new AppError("Dealership not found", 404));
  }

  if (String(payload.user) === String(dealership.owner._id)) {
    return next(
      new AppError("Dealers cannot review their own dealership", 403),
    );
  }
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
