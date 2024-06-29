import { catchAsync } from "../utils/utils.js";
import Car from "../models/carModel.js";
import {cloudinary} from "../utils/imageUploader.js";
import AppError from "../utils/appError.js";

export const createCar = catchAsync(async (req, res, next) => {
    const car = await new Car({
        ...req.body
    });
    car.dealership = req.user._id
    const image = req.file.path

    const result = await cloudinary.uploader.upload(image )

    // Not too sure what I'm doing here
    car.photos.push(result.secure_url)
    car.photosId.push(result.public_id)

    if (!car) {
        return next(new AppError("Unable to create car", 400))
    }

    await car.save()

    res.status(201).json({
        status: "success",
        data: {
            car
        }
    })
});
export const getCars = catchAsync(async (req, res, next) => {});
export const getCar = catchAsync(async (req, res, next) => {});
export const updateCar = catchAsync(async (req, res, next) => {});
export const deleteCar = catchAsync(async (req, res, next) => {});
