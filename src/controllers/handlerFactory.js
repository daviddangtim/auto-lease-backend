import { catchAsync } from "../utils/helpers.js";

export const deleteById = (service) =>
  catchAsync(async (req, res) => {
    await service(req.params.id);

    res.status(204).json({
      statusText: "success",
      data: null,
    });
  });

export const updateById = (service) =>
  catchAsync(async (req, res) => {
    const { key, value } = await service(req.body, req.params.id);

    res.status(201).json({
      statusText: "success",
      data: { [key]: value },
    });
  });

export const createOne = (service) =>
  catchAsync(async (req, res) => {
    const { key, value } = await service(req.body);

    res.status(201).json({
      statusText: "success",
      data: { [key]: value },
    });
  });

export const getOneById = (service) =>
  catchAsync(async (req, res) => {
    const { key, value } = await service(req.params.id);

    res.status(200).json({
      statusText: "success",
      data: { [key]: value },
    });
  });

export const getMany = (service) =>
  catchAsync(async (req, res) => {
    const { key, value } = await service(req.query);

    res.status(200).json({
      numResult: value.length,
      statusText: "success",
      data: { [key]: value },
    });
  });

export const deleteMany = (service) =>
  catchAsync(async (req, res) => {
    const { value } = await service(req.query);

    res.status(204).json({
      result: value,
    });
  });
