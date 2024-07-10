import * as factory from "./serviceFactory.js";
import Car from "../models/carModel.js";

export const createCar = (data) => factory.createOne(Car, data);
export const deleteCar = (carId) => factory.deleteById(Car, carId);
export const deleteManyCars = (filter) => factory.deleteMany(filter);
export const getCar = (carId) =>
  factory.getOneById(Car, carId, {}, (q) => q.lean());
export const getManyCars = (reqQuery) =>
  factory.getMany(Car, reqQuery, { sensitive: true }, (q) => q.lean());
export const updateCar = (update, carId) =>
  factory.updateById(Car, carId, update);
