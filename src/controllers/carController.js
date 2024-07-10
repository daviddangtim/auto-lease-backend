import { catchAsync, filterObject } from "../utils/helpers.js";
import Car from "../models/carModel.js";
import { cloudinary, cloudinaryImageUploader } from "../utils/imageUploader.js";
import AppError from "../utils/appError.js";
import Dealership from "../models/dealershipModel.js";



export const createCar = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const dealership = await Dealership.findOne(
      { car: { _id: userId } },
      { _id: 1 },
      { lean: true },
  ).exec();
  if (!dealership) {
    return next(new AppError("No dealership found with this ID", 404));
  }
  const payload = filterObject(req.body, ["slug", "isAvailable"], {
    exclude: true,
  });
  payload.dealership = dealership._id;
  payload.images = req.photos;
  payload.imageIds = req.photosId;
  const car = await Car.create(payload);

  res.status(201).json({
    statusText: "success",
    data: { car },
  });
});

// TODO: Implement photo functionality
export const createCarV1 = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const dealership = await Dealership.findOne(
    { car: { _id: userId } },
    { _id: 1 },
    { lean: true },
  ).exec();

  if (!dealership) {
    return next(new AppError("No dealership found with this ID", 404));
  }

  const payload = filterObject(req.body, ["slug", "isAvailable"], {
    exclude: true,
  });

  payload.dealership = dealership._id;
  const car = await Car.create(payload);

  res.status(201).json({
    statusText: "success",
    data: { car },
  });
});

export const getCars = catchAsync(async (req, res, next) => {
  const isAdmin = req.user?.role === ADMIN;
  let appQueries;

  if (isAdmin) {
    appQueries = new AppQueries(
      req.query,
      Car.find({}, {}, { lean: true }),
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
  } else {
    appQueries = new AppQueries(
      req.query,
      Car.find({}, {}, { lean: true })
    )
      .filter()
      .sort()
      .paginate();
  }

  const cars = await appQueries.query;

  res.status(200).json({
    statusText: "success",
    numResult: cars.length,
    data: { cars },
  });
});

export const getCar = catchAsync(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  const isAdmin = req.user?.role === ADMIN;
  const owner = req.user?._id.toString() === car?.dealership?.toString();

  if (!car) {
    return next(new AppError("Dealership not found", 404));
  }

  if (owner || isAdmin) {
    car.select("+vin +imei +plateNumber ");
  } else {
    car.select("-vin +imei -plateNumber ");
  }

  res.status(200).json({
    statusText: "success",
    data: { car },
  });
});

// Dangtim
export const updateCar = catchAsync(async (req, res, next) => {
  const payload = filterObject(req.body, [
    "slug",
    "dealership",
    "isAvailable"
  ], { exclude: true });

  const updateCar = await Car.findByIdAndUpdate({ dealership: req.user.id },
    payload,
    { includeResultMetadata: true, lean: true, new: true },
  ).exec();

  if (!updateCar) {
    return next(
      new AppError("No Car associated with this dealership was found", 404)
    );
  }

  res.status(200).json({
    statusText: "success",
    data: { updateCar }
  })
});

const deleteCarV1 = catchAsync(async (req,res,next)=>{
const car = await Car.findByIdAndDelete(req.params.id).exec();
// TODO: Add more flesh to the delete function 
});


