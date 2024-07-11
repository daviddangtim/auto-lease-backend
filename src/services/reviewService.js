import * as factory from "../services/serviceFactory.js";
import Review from "../models/reviewModel.js";
import { filterObject } from "../utils/helpers.js";

export const createReview = (reqBody) =>
  factory.createOne(
    Review,
    filterObject(reqBody, ["isUpdated"], { exclude: true }),
  );

export const getReview = (reviewId) =>
  factory.getOneById(Review, reviewId, (q) => q.lean());

export const getAllReviews = (reqQuery, filter) =>
  factory.getAll(Review, reqQuery, filter, (q) => q.lean());

export const updateReview = (reqBody, reviewId) =>
  factory.updateById(Review, reviewId, reqBody);

export const deleteReview = (reviewId) => factory.deleteById(Review, reviewId);
