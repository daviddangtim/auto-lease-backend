import * as factory from "./serviceFactory.js";
import Car from "../models/carModel.js";
import { filterObject } from "../utils/helpers.js";

export const createCar = (reqBody) =>
  factory.createOne(
    Car,
    filterObject(reqBody, ["slug", "isAvailable"], {
      exclude: true,
    }),
  );

export const getCar = (carId) =>
  factory.getOneById(Car, carId, (q) => q.lean().populate("reviews"));

export const getAllCars = (reqQuery, filter) =>
  factory.getAll(Car, reqQuery, filter, (q) => q.lean());

export const updateCar = (update, carId) =>
  factory.updateById(Car, carId, update);

export const deleteCar = (carId) => factory.deleteById(Car, carId);
export const deleteManyCars = (filter) => factory.deleteMany(filter);
