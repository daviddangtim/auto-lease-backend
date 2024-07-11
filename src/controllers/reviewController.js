import * as factory from "../controllers/handlerFactory.js";
import * as service from "../services/reviewService.js";

export const setCarUserIds = (req, res, next) => {
  if (!req.body.car) req.body.car = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

export const createReview = factory.createOne(service.createReview);

export const getReview = factory.getById(service.getReview);

export const updateReview = factory.updateById(service.updateReview);

export const deleteReview = factory.deleteById(service.deleteReview);

export const getAllReviews = factory.getAll(service.getAllReviews, (req) => {
  const filter = req.params.id ? { car: req.params.id } : {};
  return { filter };
});
