import { catchAsync } from "../utils/helpers.js";
import Car from "../models/carModel.js";
import { cloudinary, cloudinaryImageUploader } from "../utils/imageUploader.js";
import AppError from "../utils/appError.js";
import * as service from "../services/carService.js";
import * as factory from "../controllers/handlerFactory.js";

export const createCarV1 = catchAsync(async (req, res, next) => {
  const car = await new Car({
    ...req.body,
  });
  const urls = [];
  const files = req.files;
  for (const file of files) {
    const { path } = file;
    const newPath = await cloudinaryImageUploader(path);
    urls.push(newPath);
  }
  car.dealership = req.user._id;
  const image = req.file.path;

  const result = await cloudinary.uploader.upload(image);

  // Not too sure what I'm doing here
  car.photos.push(result.secure_url);
  car.photosId.push(result.public_id);

  if (!car) {
    return next(new AppError("Unable to create car", 400));
  }

  await car.save();

  res.status(201).json({
    status: "success",
    data: {
      car,
    },
  });
});

export const setDealershipId = (req, res, next) => {
  if (!req.body.dealership) req.body.dealership = req.params.id;
  next();
};

export const getAllCars = factory.getAll(service.getAllCars, (req) => {
  const filter = req.params.id ? { dealership: req.params.id } : {};
  return { filter };
});

export const createCar = factory.createOne(service.createCar);
export const getCar = factory.getById(service.getCar);
export const updateCar = factory.updateById(service.updateCar);
export const deleteCar = factory.deleteById(service.deleteCar);
